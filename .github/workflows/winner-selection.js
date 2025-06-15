// Winner Selection Script
(async () => {
// Get the selected raffle from workflow input
const selectedRaffle = context.payload.inputs.raffle_issue;

// Parse issue number from the selected option (format: "#123 - Event Name")
const issueMatch = selectedRaffle.match(/^#(\d+)/);
if (!issueMatch) {
  core.setFailed("Invalid raffle selection. Please select a valid raffle from the dropdown.");
  return;
}

const issue_number = parseInt(issueMatch[1], 10);
const owner = context.repo.owner;
const repo = context.repo.repo;

// 1. Get issue details to find number of winners
const { data: issue } = await github.rest.issues.get({
  owner,
  repo,
  issue_number,
});

// GitHub issue forms create markdown like this: 
// ### Number of Winners
// 3
const numWinnersRegex = /### Number of Winners\s*\r?\n\s*(\d+)/;
const numWinnersMatch = issue.body.match(numWinnersRegex);
let numWinners;
if (!numWinnersMatch) {
  // Try alternative format in case of different rendering
  const altRegex = /Number of Winners[:\s]*(\d+)/i;
  const altMatch = issue.body.match(altRegex);
  if (!altMatch) {
    core.setFailed("Could not determine the number of winners from the issue body. Please ensure the issue was created using the raffle template.");
    return;
  }
  numWinners = parseInt(altMatch[1], 10);
} else {
  numWinners = parseInt(numWinnersMatch[1], 10);
}

// 2. Fetch all comments to find participants
const comments = await github.paginate(github.rest.issues.listComments, {
  owner,
  repo,
  issue_number,
});

const issueAuthor = issue.user.login;
const participants = new Set();

for (const comment of comments) {
  const user = comment.user.login;
  
  // Exclude the issue author and bots
  if (user !== issueAuthor && !user.endsWith('[bot]')) {
    // Any comment qualifies for participation
    participants.add(user);
  }
}

const participantList = Array.from(participants);
const totalParticipants = participantList.length;
if (participantList.length === 0) {
  await github.rest.issues.createComment({
    owner,
    repo,
    issue_number,
    body: "### Raffle Result\n\nThere were no participants in this raffle."
  });
  return;
}

// 3. Select winners
const winners = [];
const count = Math.min(numWinners, participantList.length);
for (let i = 0; i < count; i++) {
  const winnerIndex = Math.floor(Math.random() * participantList.length);
  winners.push(participantList.splice(winnerIndex, 1)[0]);
}

// 4. Announce winners with excitement and avatars
let winnerMentions = winners.map(w => `@${w}`).join(', ');

// Create exciting winner display with avatars
let winnerDisplay = '';
for (let i = 0; i < winners.length; i++) {
  const winner = winners[i];
  winnerDisplay += `
<img src="https://github.com/${winner}.png" width="60" height="60" style="border-radius: 50%;"> **[@${winner}](https://github.com/${winner})**
`;
}

const announcementBody = `
# 🎉 RAFFLE RESULTS ARE IN! 🎉

## 🏆 **WINNERS ANNOUNCEMENT** 🏆

${winnerDisplay}

---

## 🎊 Congratulations to our amazing winners! 🎊

${winnerMentions} - You've won! 🎉

**What happens next?**
- An organizer will contact you soon about claiming your prizes
- Please check your GitHub notifications and email
- Thank you for participating in our community raffle!

---

*Thank you to everyone who participated! Keep an eye out for future raffles.* ✨
`;

await github.rest.issues.createComment({
  owner,
  repo,
  issue_number,
  body: announcementBody
});

// 5. Close the raffle issue to indicate completion
await github.rest.issues.update({
  owner,
  repo,
  issue_number,
  state: 'closed',
  state_reason: 'completed'
});

console.log(`✅ Raffle #${issue_number} completed successfully!`);
console.log(`🏆 Winners: ${winners.join(', ')}`);
console.log(`📊 Total participants: ${totalParticipants}`);

})(); // End of async wrapper

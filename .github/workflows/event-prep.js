// Event Preparation Script - Rename Issue Title and Post QR Code
(async () => {
const fs = require('fs');
const issue = context.payload.issue;
const issueUrl = issue.html_url;

// Only process issues created with the raffle template
if (!issue.body || !issue.body.includes('### Event Name')) {
  console.log('Not a raffle issue, skipping event preparation');
  return;
}

// Extract event name from issue body if available
// GitHub issue forms render as: ### Event Name\n<value>
const eventNameRegex = /### Event Name\s*\r?\n\s*(.+)/;
const eventNameMatch = issue.body.match(eventNameRegex);
let newTitle = issue.title;
const eventName = eventNameMatch && eventNameMatch[1].trim() !== '_No response_' && eventNameMatch[1].trim() !== '' 
  ? eventNameMatch[1].trim() 
  : 'Raffle Event';

// Generate QR code
const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${issueUrl}`;

if (eventNameMatch && eventNameMatch[1].trim() !== '_No response_' && eventNameMatch[1].trim() !== '') {
  newTitle = `🎉 Raffle: ${eventName}`;
  
  // Extract form data for a clean issue body
  const eventNameRegex = /### Event Name\s*\r?\n\s*(.+)/;
  const winnersRegex = /### Number of Winners\s*\r?\n\s*(.+)/;
  const prizeRegex = /### Prize Details\s*\r?\n\s*([\s\S]*?)(?=###|$)/;
  const descriptionRegex = /### Event Description\s*\r?\n\s*([\s\S]*?)(?=###|$)/;
  
  const eventNameValue = issue.body.match(eventNameRegex)?.[1]?.trim() || eventName;
  const winnersValue = issue.body.match(winnersRegex)?.[1]?.trim() || '1';
  const prizeValue = issue.body.match(prizeRegex)?.[1]?.trim() || 'Prize details not specified';
  const descriptionValue = issue.body.match(descriptionRegex)?.[1]?.trim() || 'Event description not provided';
  
  // Create a clean, formatted issue body
  const newBody = `# 🎉 ${eventNameValue}

## 📋 Raffle Details
- **Event**: ${eventNameValue}
- **Number of Winners**: ${winnersValue}
- **Prize**: ${prizeValue}
- **Status**: 🟢 Active
- **Participants**: Will be counted from comments below

## 📝 Description
${descriptionValue}

## 🎉 How to Participate

**It's simple!** Just leave a comment on this issue to enter the raffle. 

Scan the QR code below or share [this link](${issueUrl}) with others to join:

![QR Code](${qrCodeUrl})

**Good luck to everyone! 🍀**

---
*This raffle was created using the GitHub Raffle Template. Winners will be selected randomly using GitHub Actions.*`;
  
  // Update the issue title and body with clean, formatted content
  await github.rest.issues.update({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
    title: newTitle,
    body: newBody
  });
}

// Update Winner Selection Dropdown
try {
  // Read the current winner selection workflow
  const workflowPath = '.github/workflows/winner-selection.yml';
  let workflowContent = fs.readFileSync(workflowPath, 'utf8');

  // Find the options section and add the new raffle
  const optionsRegex = /(options:\s*\n(?:\s*-\s*"[^"]*"\s*\n)*)/;
  const optionsMatch = workflowContent.match(optionsRegex);

  if (optionsMatch) {
    let optionsSection = optionsMatch[1];
    
    // Remove the "No raffles available yet" option if it exists
    if (optionsSection.includes('"No raffles available yet"')) {
      optionsSection = optionsSection.replace(/\s*-\s*"No raffles available yet"\s*\n/, '');
    }
    
    // Add the new option (ensure proper indentation - 10 spaces to match YAML structure)
    optionsSection += `          - "#${issue.number} - ${eventName}"\n`;
    
    // Replace the options section in the workflow
    workflowContent = workflowContent.replace(optionsRegex, optionsSection);
    
    // Write the updated workflow back
    fs.writeFileSync(workflowPath, workflowContent);
    
    // Commit the change
    const { execSync } = require('child_process');
    
    try {
      // Configure git (already done by checkout action, but ensure it's set)
      execSync('git config --local user.email "action@github.com"', { stdio: 'inherit' });
      execSync('git config --local user.name "GitHub Action"', { stdio: 'inherit' });
      
      // Stage the file
      execSync('git add .github/workflows/winner-selection.yml', { stdio: 'inherit' });
      
      // Check if there are changes to commit
      try {
        execSync('git diff --cached --exit-code', { stdio: 'pipe' });
        console.log('No changes to commit');
      } catch (diffError) {
        // There are changes to commit
        execSync(`git commit -m "🎯 Add raffle #${issue.number} to winner selection dropdown"`, { stdio: 'inherit' });
        execSync('git push', { stdio: 'inherit' });
        console.log(`Successfully added raffle #${issue.number} to winner selection dropdown`);
      }
    } catch (error) {
      console.log('No changes to commit or push failed:', error.message);
    }
  }
} catch (error) {
  console.log('Failed to update dropdown:', error.message);
}

})(); // End of async wrapper

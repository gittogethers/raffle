
# GitHub-Powered Raffle

[![Use this template](https://img.shields.io/badge/--Use%20this%20template-blue?style=for-the-badge&logo=github)](https://github.com/gittogethers/raffle/generate)

A template repository to run fair, transparent, and automated raffles for your community events using **GitHub Issues** and **GitHub Actions**.

## ✨ Features

- **Zero Hosting Costs**: Runs entirely on the GitHub platform.
- **Transparent & Fair**: All entries and winner selections are public in the issue comments.
- **Fully Automated**: QR code generation and winner selection are handled by GitHub Actions.
- **Easy to Use**: Simple issue form to create new raffles.
- **Community Engagement**: Encourages interaction directly on GitHub.

## 🚀 How to Use

1.  **Use This Template**: Click the "Use this template" button at the top of this repository to create your own copy. Make sure to check "Include all branches".

2.  **Enable GitHub Actions**: In your newly created repository, go to `Settings` > `Actions` > `General`. Under "Actions permissions," select "**Allow all actions and reusable workflows**" and click `Save`.

3.  **Create a Raffle**:
    *   Go to the `Issues` tab of your repository.
    *   Click `New issue`.
    *   Select the `🎉 New Raffle Event` template.
    *   Fill out the form with your event details and submit it.

## ⚙️ How It Works

1.  **Raffle Creation**: When you create an issue using the raffle template, it gets labeled as a `raffle`.

2.  **Event Preparation**: A GitHub Action triggers, automatically updating the issue title with the event name and posting a comment with a QR code. This QR code links directly to the issue, making it easy for participants to join.

3.  **Participation**: Community members enter the raffle by commenting on the issue.

4.  **Winner Selection**: Once the entry period is over, you can manually trigger the winner selection workflow:
    *   Go to the `Actions` tab.
    *   Select `Raffle Winner Selection` from the sidebar.
    *   Click `Run workflow`.
    *   Enter the issue number of your raffle and click `Run workflow`.
    *   The action will randomly select the specified number of winners from the participants and post a comment announcing them.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/gittogethers/raffle/issues).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

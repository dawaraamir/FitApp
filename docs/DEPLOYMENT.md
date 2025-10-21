# Deploying to `main`

This project now uses `main` as the primary branch. To update it with the latest changes:

1. Ensure your working tree is clean and up to date:
   ```bash
   git status
   git pull --rebase
   ```
2. Run the available verifications before publishing:
   ```bash
   npm test
   python3 -m compileall backend
   ```
3. Fast-forward the `main` branch with your feature branch:
   ```bash
   git checkout main
   git merge --ff-only <feature-branch>
   ```
4. Push the synchronized branch:
   ```bash
   git push origin main
   ```

When collaborating with multiple developers, prefer pull requests that target `main` to keep review history intact.

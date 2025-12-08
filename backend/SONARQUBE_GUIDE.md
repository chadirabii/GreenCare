# How to Run SonarQube Analysis - Step by Step Guide

## ✅ Completed Steps

1. **Installed dependencies** - All required packages installed
2. **Generated coverage data** - All 84 tests passed
3. **Created coverage.xml** - Required for SonarQube

**Coverage Results:**
- **Total Coverage: 94%**
- plant_watering: 89%
- plants: 93%
- products: 90%

---

## 🚀 Next: Run SonarQube Scanner

### Option 1: Using SonarCloud (Recommended - Free for Public Repos)

1. **Go to SonarCloud:**
   - Visit: https://sonarcloud.io
   - Sign in with GitHub/GitLab/Bitbucket

2. **Create New Project:**
   - Click "+" → "Analyze new project"
   - Choose your organization or create one
   - Import your repository or set up manually

3. **Get Your Token:**
   - Go to: My Account → Security → Generate Tokens
   - Give it a name (e.g., "GreenCare Backend")
   - Copy the token (you'll need it next)

4. **Update sonar-project.properties:**
   Add these two lines at the top of the file:
   ```properties
   sonar.organization=YOUR_ORG_KEY
   sonar.host.url=https://sonarcloud.io
   ```

5. **Run the Scanner:**
   ```bash
   cd c:\Users\chadi\Desktop\a\GreenCare\backend
   sonar-scanner -Dsonar.login=ec7da1359c6db38bc60a71d244a4f3cd142da418
   ```

6. **View Results:**
   - Go to: https://sonarcloud.io/dashboard?id=greencare-backend
   - Take screenshots of:
     * Main dashboard
     * Coverage details
     * Issues list

---

### Option 2: Using Local SonarQube Server

1. **Start SonarQube Server:**
   - If installed locally, go to SonarQube installation folder
   - Run: `bin\windows-x86-64\StartSonar.bat`
   - Wait for server to start (check http://localhost:9000)

2. **Login to SonarQube:**
   - Open browser: http://localhost:9000
   - Default credentials: admin / admin
   - Change password when prompted

3. **Create Project:**
   - Click "Create Project" → "Manually"
   - Project key: `greencare-backend`
   - Display name: `GreenCare Backend`
   - Click "Set Up"

4. **Generate Token:**
   - When prompted, give token a name
   - Click "Generate"
   - Copy the token

5. **Run the Scanner:**
   ```bash
   cd c:\Users\chadi\Desktop\a\GreenCare\backend
   sonar-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.login=YOUR_TOKEN
   ```

6. **View Results:**
   - Refresh the dashboard at http://localhost:9000
   - Click on "GreenCare Backend" project
   - Take screenshots!

---

## 📸 Screenshots to Take

Once analysis is complete, capture these screenshots:

### 1. Main Dashboard (`sonarqube_dashboard.png`)
   - Overview page showing:
     * Quality Gate status
     * Bugs count
     * Vulnerabilities count  
     * Code Smells count
     * Coverage percentage
     * Duplications
     * Technical Debt

### 2. Coverage Details (`sonarqube_coverage.png`)
   - Click on "Coverage" metric
   - Show breakdown by file/module
   - Highlight the three entities

### 3. Issues List (`sonarqube_issues.png`)
   - Click on "Issues" tab
   - Filter by type (Bugs, Vulnerabilities, Code Smells)
   - Show the list with severity levels

---

## 💾 Save Screenshots

After taking screenshots, save them to:
```
c:\Users\chadi\Desktop\a\GreenCare\rappport\media\
```

Replace the existing placeholder images:
- `sonarqube_dashboard.png`
- `sonarqube_coverage.png`
- `sonarqube_issues.png`

---

## 📝 Update Report Values

After analysis, update the LaTeX report with real values:

Open `c:\Users\chadi\Desktop\a\GreenCare\rappport\main.tex` and replace:
- `--` with actual Code Smells count
- `--\%` with actual Duplication percentage
- `-- jours` with actual Technical Debt
- `-- heures` with module-specific technical debt

---

## ⚠️ Troubleshooting

**Issue:** `sonar-scanner` command not found
- **Solution:** Add SonarScanner to PATH or use full path:
  ```
  C:\sonar-scanner\bin\sonar-scanner.bat -Dsonar.login=TOKEN
  ```

**Issue:** "No coverage information" in SonarQube
- **Solution:** Verify `coverage.xml` exists in backend folder
- Re-run: `coverage xml`

**Issue:** Connection refused to localhost:9000
- **Solution:** Start SonarQube server first
- Check logs in `logs/sonar.log`

---

## ✨ Summary

You're now ready to run SonarQube! The coverage.xml file is ready at:
`c:\Users\chadi\Desktop\a\GreenCare\backend\coverage.xml`

Choose either SonarCloud or local SonarQube, run the scanner, and take your screenshots!

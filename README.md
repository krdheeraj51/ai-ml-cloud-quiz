# AI · ML · Cloud Daily Quiz

A simple static quiz website designed for GitHub Pages.

## What it does

- Shows a separate quiz for each published date.
- Lets users select one option for every MCQ.
- Requires all questions to be answered before submission.
- Reveals correct/incorrect selections only after submission.
- Shows an explanation for every question.
- Calculates the final score.
- Supports retrying the same quiz.
- Supports browsing previous quiz dates.

## Add a new daily quiz

Open:

`data/quizzes.js`

Copy the example date block and add a new entry such as:

`"2026-09-01": { ... }`

Use a unique date and add your 3 questions.

## Publish with GitHub Pages

1. Push these files to your GitHub repository.
2. Open the repository on GitHub.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the branch (normally `main`) and folder `/ (root)`.
6. Save.

GitHub will provide the public Pages URL after deployment.

## Recommended daily question structure

- Question 1: AI
- Question 2: Machine Learning
- Question 3: Cloud

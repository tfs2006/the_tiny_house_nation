# Tiny House Build Companion

A comprehensive utility tool for tiny house builders. This single-page application helps builders plan their budget, estimate weight, and size their solar power systems.

## Features

### 1. Dashboard
-   **Overview**: See your total estimated cost, weight, and energy needs at a glance.
-   **Visuals**: A dynamic doughnut chart breaks down your budget by category.

### 2. Budget Tracker
-   **Categorized Expenses**: Add items to categories like 'Lumber', 'Trailer', 'Electrical', etc.
-   **Running Total**: Automatically calculates the total estimated cost of your build.

### 3. Weight Estimator
-   **Safety First**: Input your trailer's GVWR (Gross Vehicle Weight Rating) and base weight.
-   **Payload Tracking**: Add materials and appliances to see how much payload capacity you have left.
-   **Visual Meter**: A progress bar warns you if you are approaching or exceeding your weight limit.

### 4. Solar Sizing Calculator
-   **Off-Grid Planning**: List your appliances, their wattage, and daily usage hours.
-   **Auto-Calculation**: The tool automatically recommends:
    -   **Solar Panel Array Size (Watts)**: Based on 5 peak sun hours and system efficiency.
    -   **Battery Bank Size (Ah)**: Based on a 12V system and 50% depth of discharge (DOD).

## Technical Details
-   **Stack**: HTML5, CSS3, Vanilla JavaScript.
-   **Persistence**: Uses 'localStorage' to save your data in the browser, so you don't lose your plan when you refresh.
-   **Libraries**: 
    -   [Chart.js](https://www.chartjs.org/) for data visualization.
    -   [FontAwesome](https://fontawesome.com/) for icons.
    -   [Google Fonts](https://fonts.google.com/) (Inter font family).

## Deployment
This is a static site. Simply host the files on GitHub Pages, Netlify, or Vercel.

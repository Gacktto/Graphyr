<h1 align="center">Graphyr</h1>

<p align="center">
  <strong>A no-code web platform for building fully customized data dashboards.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/Gacktto/graphyr" alt="license">
  <img src="https://img.shields.io/github/last-commit/Gacktto/graphyr" alt="last commit">
  <img src="https://img.shields.io/github/languages/top/Gacktto/graphyr" alt="languages">
  <img src="https://img.shields.io/badge/status-developing-yellow" alt="status">
</p>

## Overview

**Graphyr** is a powerful online editor that gives you full creative control to design beautiful and interactive data dashboards from scratch, without code. It is inspired by modern no-code/low-code web editors, aiming to be a flexible open-source alternative.

## Summary

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Run Locally](#run-locally)
- [Roadmap](#roadmap)
- [License](#license)

## Features

- **Dynamic Canvas:** A flexible space to bring your pages and dashboards to life.
- **Frame:** A space to create your designs that will be published.
- **Floating Action Bar:** Quickly select creation modes and tools from an intuitive, accessible toolbar.
- **CSS-Based Properties Panel:** Edit element properties like colors, dimensions, and spacing using familiar CSS-based controls.
- **Element Tree View:** Easily view, select, and organize your elements in a hierarchical layer panel.
- **Smart Guides & Snapping:** Precisely align elements with smart guides and automatic snapping for a pixel-perfect layout.
- **Intuitive Element Resizing:** Resize any element by simply dragging its handles.
- **Essential Keyboard Shortcuts:**
  | Action | Shortcut |
  | :--- | :--- |
  | Copy / Paste | `Ctrl + C` / `Ctrl + V` |
  | Delete | `Delete` |
  | Undo / Redo | `Ctrl + Z` / `Ctrl + Shift + Z` |
  | Zoom In / Out | `Ctrl + Mouse Wheel` |
  | Move Canvas | `Space + Drag` |

## Tech Stack

- **Frontend:** [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **State Management:** [React Context](https://react.dev/reference/react/createContext)
- **Canvas Rendering:** [React](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Backend:** `(Not yet implemented)`
- **Real-time Communication:** `(Not yet implemented)`

## Run Locally

### Requirements

- [Node.js](https://nodejs.org/) (`v18.x` or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/Gacktto/graphyr.git
    ```

2.  **Navigate to the project directory:**

    ```sh
    cd Graphyr
    ```

3.  **Install dependencies:**

    ```sh
    npm install
    # or
    yarn install
    ```

4.  **Start the development server:**

    ```sh
    npm run dev
    # or
    yarn dev
    ```

5.  **Open your browser** and navigate to the local address provided by Vite.

## Roadmap

Next features that will be in the project:

- [ ] Data Integration (Import/Export CSV, JSON)
- [ ] Customizable Grid & Layout Aids
- [ ] Reusable Components
- [ ] Advanced Text Transformation Options
- [ ] Real-time Collaboration (via WebSockets)
- [ ] User Authentication & Cloud Project Storage

## License

This project is distributed under the **GNU General Public License v3.0 (GPL-3.0)**.

See the `LICENSE` file in the project root for the full text and further details.

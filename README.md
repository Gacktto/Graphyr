<h1 align="center">Graphyr</h1>

<p align="center">
  <strong>No-code web platform for building fully customized data dashboards</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/Gacktto/graphyr" alt="license">
  <img src="https://img.shields.io/github/last-commit/Gacktto/graphyr" alt="last commit">
  <img src="https://img.shields.io/github/languages/top/Gacktto/graphyr" alt="languages">
  <img src="https://img.shields.io/badge/status-developing-yellow" alt="status">
</p>

## Overview

**Graphyr** is (would be) a powerful online editor that gives you full creative control to design beautiful and interactive data dashboards from scratch, without code. Inspired on moderns web no-code/low-code editors.

## Summary

* [Features](#features)
* [Techs](#techs)
* [Run Locally](#run-locally)
  * [Requirements](#requirements)
  * [Installation](#installation)
* [Roadmap](#roadmap)
* [License](#license)


## Features

Some features that have already been implemented

* **Canvas:** A space to create your pages.
* **Frame:** A space to create your designs.
* **Action Bar:** A floating bar on the left side to select the creation mode.
* **Properties Panel:** A bar on the right side to edit the properties of elements, based on CSS properties.
* **Tree View Panel:** A bar on the left side to show your element tree and organize them.
* **Keyboard Shortcuts:**
  *  **Copy & Paste:** `Ctrl + c` `Ctrl + v`
  *  **Delete:** `Delete`
  *  **Undo & Redo:** `Ctrl + z` `Ctrl + Shift + z`
  *  **Zoom in/out:** `Ctrl + Mouse Wheel`
  *  **Move Canvas:** `Space + Mouse Left Button + Drag`
* **Resize Element Handles:** The element can be resized by dragging its corners.
* **Guidelines & Snap:** Guidelines when resizing or dragging elements.


## Techs

* **Frontend:** [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
* **Canvas:** [React](https://reactjs.org/)
* **States:** [React Context](https://react.dev/reference/react/createContext)
* **Backend:** Not yet
* **Socket:** Not yet
* **Build Tool:** [Vite](https://vitejs.dev/)


## Run Locally

### Requirements

* [Node.js](https://nodejs.org/) (`v18.x`++)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone repo:**
    ```sh
    git clone https://github.com/Gacktto/graphyr.git
    ```

2.  **Go to Graphyr dir:**
    ```sh
    cd Graphyr
    ```

3.  **Install dependencies:**
    ```sh
    npm install
    # or
    yarn install
    ```

5.  **Start the development server:**
    ```sh
    npm run dev
    # or
    yarn dev
    ```

6.  **Open the launched server address in the browser.**


## Roadmap

Next features that will be in the project

* [ ] Import/Export Data Tables
* [ ] Canvas grid
* [ ] Components
* [ ] Text transformation options
* [ ] Real-time collaboration
* [ ] User account
* [ ] Persistent project storage


## License

This project is distributed under the **GNU General Public License v3.0 (GPL-3.0)**.

See the `LICENSE` file in the project root for the full text and further details.

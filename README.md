# SurgiCalm Frontend Documentation

This document provides a comprehensive technical overview of the SurgiCalm React Native application. It is designed to onboard new engineers and serve as a central source of truth for the project's architecture, components, and core processes.

---

## Part I: Foundational Concepts & Design System

This section establishes the core rules, structure, and aesthetic principles that govern the entire application. Understanding these foundations is crucial before diving into specific components or screens.

---
## Directory Structure

The project's frontend code is contained entirely within the `src/` directory. This directory is organized by feature and responsibility to ensure a logical and scalable structure.

* **`src/Components`**: This is the library for all reusable components used throughout the app. It is the foundation of the UI and is further organized by component type.
    * **`src/Components/AV`**: Contains media playback components, specifically for audio and video content.
    * **`src/Components/Cards`**: Holds card-like UI elements that encapsulate specific pieces of information, such as input fields, modules, and quotes.
    * **`src/Components/NavBars`**: Contains the custom-built tab bar components used for both patient and nurse navigation.
    * **`src/Components/Services`**: Holds the non-visual, cross-cutting logic that powers the application. This includes state management contexts, authentication services, and caching logic.
    * **`src/Components/Skeletons`**: Contains the placeholder components used to create shimmer loading effects, enhancing the user's perception of performance during data fetching.
* **`src/Navigation`**: This directory contains all React Navigation configurations. It defines the navigation stacks and flows for the different user roles within the app.
* **`src/Pages`**: Contains the top-level screen components. Each file in this directory typically represents a full screen view and is responsible for assembling various reusable components to build the UI.
    * **`src/Pages/Login`**: Holds screens related to the authentication user journey, including the main login and password recovery screens.
    * **`src/Pages/Nurse`**: Contains all screens that are part of the nurse/administrator user experience, such as patient lookup and account creation.
    * **`src/Pages/Patient`**: Contains all screens that are part of the core patient experience, primarily the dashboard and the educational content library.

---
## Design System

While there is no formal design system library like Storybook, the application adheres to a consistent set of aesthetic and layout principles.

### Color Palette

The app uses a distinct and consistent color palette to define its identity and convey information.

* **Primary**: `#AA336A` - The main brand color used for backgrounds, gradients, and borders.
* **Background**: `#FFFFFF` - Standard white used for card backgrounds and text areas.
* **Success**: `#4CAF50` / `#E8F5E9` - Green shades used to indicate completed tasks or successful actions.
* **Action/Incomplete**: `#D9534F` / `#FDECEA` - Red shades used to indicate actionable or incomplete modules.

### Typography

All text in the application is rendered using a single, consistent font family to maintain a uniform look and feel.

* **Font Family**: `Cairo`.
* **Weights**: The font is used in various weights. A regular weight (`400`) is used for body text and descriptions, while a bold weight (`700` or `'bold'`) is used for titles and headers.

### Layout Principles

The application's layout is built on a few core, reusable principles.

* **Gradient Background**: Nearly every screen utilizes a `LinearGradient` component that transitions from the primary brand color (`#AA336A`) to white, creating a signature background effect.
* **Card-Based UI**: Information is consistently presented within styled "cards"—components with rounded corners, borders, and distinct backgrounds. This applies to everything from daily modules to patient detail fields.
* **Responsive Sizing**: Key UI elements, like the main logo, dynamically adjust their size based on the screen width. This is achieved by using the `Dimensions` API from React Native to ensure a better fit on both smaller and larger devices.

---

## Part II Section I: The Visual Component Library 

This section provides a complete catalog of the reusable components that form the building blocks of the SurgiCalm application. Each component is documented in isolation to explain its purpose, props, and usage.

## *Skeletons Directory*

This directory contains all loading state placeholder components. They are used to improve the user experience by providing visual feedback while data is being fetched from the server.

---
## ModuleSkeleton.js

### a. Purpose
A loading state placeholder component that mimics the layout of a `ModuleCard` and displays a shimmering effect while content is being fetched.

### b. Props

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| *None* | - | - | This component does not accept any props. |

---
## GraphSkeleton.js

### a. Purpose
A loading state placeholder component that mimics the shape of the `Graph` component, displaying a shimmering effect while the graph's data is being fetched.

### b. Props

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| *None* | - | - | This component does not accept any props. |

---
## QuoteSkeleton.js

### a. Purpose
A loading state placeholder that mimics the layout of the `QuoteCard`, displaying a shimmering effect while the quote content is being fetched.

### b. Props

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| *None* | - | - | This component does not accept any props. |

---
## AssortedSkeleton.js

### a. Purpose
A loading placeholder for list items, featuring a shimmering text line and an optional icon placeholder, designed to mimic the appearance of items on the 'Assorted' content screens.

### b. Props

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `showIcon` | `boolean` | No | If `true`, displays a shimmering placeholder for an icon on the right side of the component. Defaults to `false`. |

## *AV Directory*

This directory contains components responsible for media playback.

---
## AudioPlayer.js

### a. Purpose
A manually controlled component that loads and plays audio from a URL, providing its own play/pause button and state management.

### b. Props

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sourceUrl` | `string` | Yes | The URL of the audio file to be played. |
| `iconColor` | `string` | No | The color of the play/pause icon. Defaults to `white`. |
| `iconSize` | `number` | No | The size of the play/pause icon. Defaults to `60`. |
| `onFinish` | `() => void` | No | A callback function that is executed when the audio track finishes playing. |
| `onPlaybackError`| `(error: string) => void`| No | A callback function that is executed if an error occurs during loading or playback. |

---
## VideoPlayer.js

### a. Purpose
A component that renders a video from a URL, delegating playback controls (play, pause, scrub) to the native system UI.

### b. Props

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sourceUrl` | `string` | Yes | The URL of the video file to be played. |
| `onFinish` | `() => void` | No | A callback function that is executed when the video finishes playing. |
| `onPlaybackError`| `(error: string) => void`| No | A callback function that is executed if an error occurs during playback. |

## *NavBars Directory*

This directory contains the custom tab bar components used for app-wide navigation for each user role.

---
## NurseNavbar.js

### a. Purpose
A custom tab bar that provides top-level navigation for the nurse user and contains the application's master logout logic.

### b. Props

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| *None* | - | - | This component does not accept any props. |

---
## PatientNavbar.js

### a. Purpose
A custom tab bar that provides top-level navigation between the Dashboard, Content Library, and Settings screens for the patient user.

### b. Props

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| *None* | - | - | This component does not accept any props. |










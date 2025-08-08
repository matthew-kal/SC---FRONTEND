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
## Part II Section II: Services & Core Processes

This section documents the non-visual services and logical processes that power the application.

---
## *Services Directory*

This section provides a complete catalog of the reusable services that form the logical foundation of the SurgiCalm application. Each service is documented in isolation to explain its purpose and functionality.

---
## TokenContext.js

**a. Purpose**
This context serves as the application's central authority on authentication status. It determines if a user is logged in and what their role is ('patient' or 'nurse'). This component provides global state to the entire application, wrapped at the highest level in `App.js`.

**b. Provided Values**
The following values are available to any component that consumes this context.

| Value | Type | Description |
| :--- | :--- | :--- |
| `userType` | `string` | The role of the currently authenticated user: `'patient'`, `'nurse'`, or `''` (logged out). |
| `setUserType` | `function` | The setter function to update the `userType` state. |
| `isInitialized` | `boolean` | A flag that is `true` only after the context has finished its initial check of stored tokens on app startup. This is used to prevent race conditions. |

---
## PatientContext.js

**a. Purpose**
This context acts as a global signaling system, primarily to tell the patient dashboard when it needs to refresh its data. This component provides global state to the entire application, wrapped at the highest level in `App.js`.

**b. Provided Values**
The following values are available to any component that consumes this context.

| Value | Type | Description |
| :--- | :--- | :--- |
| `refresh` | `boolean` | A flag that can be set to `true` to manually trigger a data refresh on listening components. |
| `setRefresh` | `function` | The setter function to update the `refresh` state. |
| `date` | `number` | Stores the day of the month the dashboard was last loaded, used to trigger an automatic refresh once per day. |
| `setDate` | `function` | The setter function to update the `date` state. |

---
## Memory.js
**a. Purpose**
This service manages all interactions with the device's secure storage. It is a centralized module that acts as a secure wrapper around the `expo-secure-store` library, abstracting all secure storage operations (get, save, delete) and providing robust error handling for interacting with the device's Keychain/Keystore.

**b. Functions**

| Function | Parameters | Description |
| :--- | :--- | :--- |
| `getSecureItem` | `key: string` | Asynchronously retrieves an item from SecureStore by its key. Returns `null` if an error occurs. |
| `saveSecureItem`| `key: string`, `value: string` | Asynchronously saves a key-value pair to SecureStore with a security policy that only allows access when the device is unlocked. |
| `deleteSecureItem`| `key: string` | Asynchronously deletes an item from SecureStore by its key. |
| `clearTokens` | *None* | A high-level utility function that removes all user-specific data from SecureStore, including all authentication tokens and biometric settings, to perform a full local logout. |

---
## BiometricAuth.js

**a. Purpose**
A comprehensive service, structured as a class with static methods, that manages all aspects of biometric authentication. It handles device capability checks, user preferences, the authentication prompt, and a robust 3-strike security lockout mechanism.

**b. Static Methods**

| Method | Parameters / Return | Description |
| :--- | :--- | :--- |
| `isAvailable` | *returns `Promise<boolean>`* | Checks if the device has biometric hardware and if the user has enrolled biometrics. Returns `true` if available. |
| `getUserPreference`| *returns `Promise<object | null>`* | Retrieves the user's stored preference for using biometric auth (or `null` if not set). |
| `setUserPreference`| `enabled: boolean`, `userType: string` | Saves the user's choice to enable or disable biometric authentication. |
| `authenticate` | *returns `Promise<object>`* | The main method to trigger the biometric prompt. It performs security checks first. Returns an object with `{ success: boolean }` and an `error` key on failure. |
| `promptForBiometricSetup`| `userType: string` | Shows a native alert to the user asking if they want to enable biometrics after their first login. Only available for 'patient' user type. |
| `isLockedOut` | *returns `Promise<boolean>`* | Checks if the user is currently in a security lockout due to too many failed attempts. |
| `incrementFailedAttempts`| *returns `Promise<boolean>`* | Increments the failed attempt counter. Returns `true` if the increment triggered a security lockout. |
| `clearLockout` | *returns `void`* | Clears any existing lockout timestamp and resets the failed attempts counter. |

---
## CacheManager.js

**a. Purpose**
A service dedicated to managing a local cache for application content using `AsyncStorage`. It implements a 'Global Expiration' strategy with a 12-hour Time-To-Live (TTL) to reduce API calls and improve performance by serving stale content until the timer expires.

**b. Functions**

| Function | Parameters | Description |
| :--- | :--- | :--- |
| `isCacheStale` | *None* | Checks if the global 12-hour cache timer has expired. Returns `true` if the cache is stale and needs to be busted. |
| `bustAndResetCache` | *None* | Deletes all items from `AsyncStorage` that have the designated cache prefix and then resets the global 12-hour timer. |
| `get` | `key: string` | Retrieves a specific JSON-parsed item from the cache by its key. Returns `null` if not found. |
| `set` | `key: string`, `value: object` | Saves a specific key-value pair to the cache, wrapping the data in an object with a timestamp. |

---
## Logout.js

**a. Purpose**
A self-contained UI component that renders a 'Logout' title and a button. It contains the logic to perform a full and secure user logout by clearing local credentials and invalidating the server session. It is explcitly meant for the patient settings. 

**b. Props**

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| *None* | - | - | This component does not accept any props. |

---
## Notifications.js

**a. Purpose**
This service handles the logic for registering a device to receive push notifications. It is a service module containing the complete, end-to-end logic for registering a user's device for push notifications. It handles permissions, Expo Push Token generation, and submission of the token to the backend server.

**b. Functions**

| Function | Parameters | Description |
| :--- | :--- | :--- |
| `registerForPushNotificationsAsync` | *None* | An async function that performs all steps to register for push notifications: checks for a logged-in user and physical device, requests user permission, gets the Expo Push Token, and sends the token to the backend server. |

---

## Part III Section I:  Screens & Features of the *Login Directory*

This section establishes the core rules, structure, and aesthetic principles that govern the Login portion of the application. Understanding these foundations is crucial before diving into specific components or screens. 

---
## Login.js

**a. Overview**
This is the central entry point for the entire application, functioning as a highly stateful component that manages the complete authentication lifecycle. **The primary design goal is to provide a single, robust gateway that can securely handle multiple user-facing scenarios:** a fast, seamless Single Sign-On (SSO) for returning patients, and clear, distinct manual login paths for both new patients and nurses.

**b. Visual Flow & UI States**
The screen transitions through several distinct visual states based on the authentication status and user interaction.
1.  **Initial Loading State**: On first launch, a full-screen loading indicator is displayed. It shows an animated spinner and provides context to the user, indicating whether the app is initializing or checking for a stored session. This state is active as long as fonts are loading, the `TokenContext` is not yet initialized, or the `isCheckingSSO` state is `true`.
2.  **Login Role Selection**: Once loading is complete and no SSO session is found, the screen presents two primary buttons: "Patient Login" and "Admin Login".
3.  **Form Display State**: Tapping one of the role selection buttons hides the other and reveals the `LoginForm` sub-component for the selected role. The UI is managed by the `renderPatient` and `renderNurse` state variables to ensure only one form is visible at a time.
4.  **In-Request Loading State**: When the user submits a login form, the `isLoading` state is activated. This visually disables the login button and reduces its opacity, providing immediate feedback that a network request is in progress.

**c. State Management & Rationale**
The component's state is meticulously managed to control the complex UI and logical flows.

| State Variable / Context | Type | Role & Rationale |
| :--- | :--- | :--- |
| **Consumed Context** | | |
| `isInitialized` | `boolean` | From `TokenContext`. **Rationale**: This is a critical guard flag that prevents a race condition. The SSO logic does not run until this is `true`, ensuring the app doesn't incorrectly decide a user is logged out before the asynchronous check for stored tokens is complete. |
| `setUserType` | `function` | From `TokenContext`. **Rationale**: This sets the user's role globally, allowing the entire app to react to the authenticated state. |
| `setRefresh` | `function` | From `PatientContext`. **Rationale**: This acts as a signal to the `Dashboard`, telling it to fetch fresh data after a login. This decouples the `Login` screen from the `Dashboard`, so neither needs direct knowledge of the other. |
| **Local State** | | |
| `renderPatient`/`renderNurse` | `boolean` | **Rationale**: These mutually exclusive flags control which login form is visible, ensuring a clean and unambiguous UI for the user. |
| `isCheckingSSO` | `boolean` | **Rationale**: This flag specifically controls the visibility of the SSO loading screen, providing more granular feedback to the user than a generic loading state. |
| `isLoading` | `boolean` | **Rationale**: This centralized state perfectly syncs the login button's disabled/opacity state with the real-time status of a network request, preventing double-submissions and providing clear user feedback. |
| `patientUsername`/`etc.` | `string` | Four separate state variables to hold the credentials entered into the two login forms. |
| `error` | `string` | Stores error messages from login attempts for potential display in the UI. |

**d. Core Logic & Design Decisions**
The screen's functions are designed for security, robustness, and a clear user journey.

* **`useFocusEffect` Hook**:
    * **Action**: Resets all form inputs and UI state variables to their initial state every time the user navigates *to* this screen.
    * **Rationale**: This ensures a predictable, clean-slate experience, preventing stale data from a previous session from being displayed.

* **Single Sign-On (SSO) Process**:
    * **`useEffect` (Trigger)**: This effect is gated by the `isInitialized` flag from `TokenContext`. Once `true`, it calls `checkStoredLoginStatus`.
    * **`checkStoredLoginStatus`**: Sets `isCheckingSSO` to `true`, then checks `SecureStore` for a `refreshPatient` token. If found, it proceeds to the next step.
    * **`checkAndAuthenticatePatient`**: This is the main SSO decision function. It first calls `BiometricAuth.shouldAttemptBiometricAuth`. If this returns `true`, it triggers the biometric prompt. A successful biometric scan leads to the token refresh step. If biometrics are not used, it proceeds directly to the refresh step. It contains detailed handling for different biometric failure scenarios (user cancellation vs. lockout).
    * **`refreshPatientAccessToken`**: This function takes the stored `refreshToken` and attempts to get a new `accessToken` from the backend. It uses an `AbortController` to enforce a 10-second timeout. On success, it saves the new tokens, updates the global `userType`, and navigates the user into the patient section of the app.
        * **Endpoint**: `POST /api/token/refresh/`
        * **Request Body**:
          ```json
          {
            "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          }
          ```
        * **Success Response**:
          ```json
          {
            "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          }
          ```
        * **Error Response**:
          ```json
          {
              "detail": "Token is invalid or expired",
              "code": "token_not_valid"
          }
          ```

* **Manual Login Process**:
    * **`handlePatientLogin`**: Triggered by the patient form submission.
        * **Endpoint**: `POST /users/patient/login/`
        * **Request Body**:
          ```json
          {
            "username": "some_patient",
            "password": "correct_password"
          }
          ```
        * **Success Response**:
          ```json
          {
            "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          }
          ```
        * **Error Response**:
          ```json
          {
            "error": "Invalid credentials"
          }
          ```
    * **`handleNurseLogin`**: Triggered by the nurse form submission.
        * **Endpoint**: `POST /users/nurse/login/`
        * **Request Body**:
          ```json
          {
            "username": "some_nurse",
            "password": "correct_password"
          }
          ```
        * **Success Response**:
          ```json
          {
            "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          }
          ```
        * **Error Response**:
          ```json
          {
            "error": "Invalid credentials"
          }
          ```

* **User Permission & Onboarding Flows**:
    * **Biometric Setup**: After a patient's first login, `BiometricAuth.promptForBiometricSetup` shows a native `Alert` asking if they want to enable Face ID/Touch ID. If the user selects "Not Now," their preference is saved, and the login process continues seamlessly.
    * **Push Notification Registration**: The `registerForPushNotificationsAsync` function is called after a successful patient login. Internally, this function will trigger the OS-level permission prompt if the user has not already responded. If the user denies the permission, the function silently aborts; the user can still use the app but will not receive notifications.

**e. Services & Hooks Consumed**
* **`useNavigation`**, **`useFocusEffect`**: Standard React Navigation hooks for navigation control and screen focus events.
* **`TokenContext`**, **`PatientContext`**: For interacting with global state.
* **`Memory.js`**: Uses `getSecureItem`, `saveSecureItem`, and `deleteSecureItem` for all secure storage interactions.
* **`Notifications.js`**: Calls `registerForPushNotificationsAsync` after a successful patient login.
* **`BiometricAuth.js`**: Heavily used throughout the SSO flow to check for, prompt, and authenticate with biometrics.

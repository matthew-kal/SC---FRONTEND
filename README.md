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

---
## *Cards Directory*
This directory contains card-like UI elements that encapsulate specific pieces of information or functionality.

---
## CustomInput.js

**a. Purpose**
A controlled text input component with a floating label animation, an optional show/hide password toggle, and error message display.

**b. Props**

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `containerStyle` | `Style` | No | Custom styles for the outer `View` container. |
| `placeholder` | `string` | Yes | The text for the floating label. |
| `onChangeText` | `(text: string) => void` | Yes | Callback function that receives the updated text from the input. |
| `value` | `string` | Yes | The value of the input, making it a controlled component. Passed via `...props`. |
| `error` | `string` | No | If provided, displays an error message below the input and highlights the border in red. |
| `secureTextEntry` | `boolean` | No | If `true`, hides the text for password entry and displays a toggle to show/hide the password. |
| `...props` | `TextInputProps` | No | Any other standard `TextInput` props (e.g., `keyboardType`, `autoCapitalize`) are passed through to the underlying `TextInput` component. |

---
## QuoteCard.js

**a. Purpose**
A simple, styled card component designed to display a quote, with a fallback to a default quote if none is provided.

**b. Props**

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `text` | `string` | No | The quote text to display. If omitted, a default quote is shown instead. |

---
## ModuleCard.js

**a. Purpose**
A versatile card that displays an educational module or a daily task, with dynamic styling to reflect its completion status.

**b. Props**

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `item` | `object` | Yes | An object containing module details, such as `name`, `title`, `description`, and `isCompleted`. |
| `onPress` | `() => void` | Yes | Callback function executed when the card is tapped. |
| `isTask` | `boolean` | No | If `true`, treats the card as a task, displaying its description and disabling the press action if completed. Defaults to `false`. |

---
## PrivacyPolicy.js

**a. Purpose**
A self-contained component that displays a title and an icon to open a full-screen, scrollable modal with the complete privacy policy text.

**b. Props**

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| *None* | - | - | This component does not accept any props. |

---
## Graph.js

**a. Purpose**
A data visualization component that renders a bar chart for weekly patient activity and displays summary statistics for weekly and all-time engagement.

**b. Props**

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `weeklyData` | `Array<object>` | Yes | An array of data objects for the bar chart, where each object should have `x` (day label) and `y` (value) keys. |
| `dailyData` | `Array<number>` | Yes | An array containing two numbers: the total weekly engagement at index `0` and the all-time engagement at index `1`. |
| `containerStyle` | `Style` | No | Styles passed from the parent component to define the card's layout and positioning. |

---
## PatientInfoCard.js

**a. Purpose**
A simple, presentational component that displays a patient's key information (username, email, and ID). It is designed to be placed within a styled container provided by a parent screen.

**b. Props**

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `username` | `string` | Yes | The patient's username to be displayed. |
| `email` | `string` | Yes | The patient's email address to be displayed. |
| `id` | `number` | Yes | The patient's unique ID to be displayed. |
| `containerStyle` | `Style` | No | Styles passed from the parent component to define the card's layout, borders, and positioning. |


---
## *Skeletons Directory*

This directory contains all loading state placeholder components. They are used to improve the user experience by providing visual feedback while data is being fetched from the server.

---
## PatientDetailsSkeleton.js

**a. Purpose**
A loading state placeholder that mimics the layout of the `PatientInfoCard`. It displays three shimmering lines to provide a seamless visual transition while the patient's data is being fetched.

**b. Props**

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `containerStyle` | `Style` | No | Styles passed from the parent component to ensure the skeleton's container perfectly matches the `PatientInfoCard`'s container. |

---
## ModuleSkeleton.js

**a. Purpose**
A loading state placeholder component that mimics the layout of a `ModuleCard` and displays a shimmering effect while content is being fetched.

**b. Props**

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| *None* | - | - | This component does not accept any props. |

---
## GraphSkeleton.js

**a. Purpose**
A loading state placeholder component that mimics the shape of the `Graph` component, displaying a shimmering effect while the graph's data is being fetched.

**b. Props**

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| *None* | - | - | This component does not accept any props. |

---
## QuoteSkeleton.js

**a. Purpose**
A loading state placeholder that mimics the layout of the `QuoteCard`, displaying a shimmering effect while the quote content is being fetched.

**b. Props**

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| *None* | - | - | This component does not accept any props. |

---
## AssortedSkeleton.js

**a. Purpose**
A loading placeholder for list items, featuring a shimmering text line and an optional icon placeholder, designed to mimic the appearance of items on the 'Assorted' content screens.

**b. Props**

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `showIcon` | `boolean` | No | If `true`, displays a shimmering placeholder for an icon on the right side of the component. Defaults to `false`. |

---
## *AV Directory*

This directory contains components responsible for media playback.

---
## AudioPlayer.js

**a. Purpose**
A manually controlled component that loads and plays audio from a URL, providing its own play/pause button and state management.

**b. Props**

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sourceUrl` | `string` | Yes | The URL of the audio file to be played. |
| `iconColor` | `string` | No | The color of the play/pause icon. Defaults to `white`. |
| `iconSize` | `number` | No | The size of the play/pause icon. Defaults to `60`. |
| `onFinish` | `() => void` | No | A callback function that is executed when the audio track finishes playing. |
| `onPlaybackError`| `(error: string) => void`| No | A callback function that is executed if an error occurs during loading or playback. |

---
## VideoPlayer.js

**a. Purpose**
A component that renders a video from a URL, delegating playback controls (play, pause, scrub) to the native system UI.

**b. Props**

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sourceUrl` | `string` | Yes | The URL of the video file to be played. |
| `onFinish` | `() => void` | No | A callback function that is executed when the video finishes playing. |
| `onPlaybackError`| `(error: string) => void`| No | A callback function that is executed if an error occurs during playback. |

## *NavBars Directory*

This directory contains the custom tab bar components used for app-wide navigation for each user role.

---
## NurseNavbar.js

**a. Purpose**
A custom tab bar that provides top-level navigation for the nurse user and contains the application's master logout logic.

**b. Props**

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| *None* | - | - | This component does not accept any props. |

---
## PatientNavbar.js

**a. Purpose**
A custom tab bar that provides top-level navigation between the Dashboard, Content Library, and Settings screens for the patient user.

**b. Props**

| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| *None* | - | - | This component does not accept any props. |

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

## Part II Section III: *Navigation Directories*
This section documents the files that define the application's root structure, navigation flows, and global context providers.

---
### App.js

**a. Overview**
This is the absolute root component of the application. Its primary responsibility is to set up the top-level navigation container and wrap the entire app in global context providers, making routing and global state available to all other components.

**b. Core Logic & Design Decisions**
* **Global Context Providers**: The entire component tree is wrapped within `TokenProvider` and `PatientProvider`.
    * **Rationale**: Placing the providers at the highest possible level is the correct way to implement global state. This ensures that any component, no matter how deeply nested, can access authentication status and other global values.
* **Root Stack Navigator**: The component uses a `StackNavigator` as its root navigator.
    * **Rationale**: This stack manages the primary states of the application. It contains the unauthenticated screens (`Login`, `PasswordRecovery`) and the entire authenticated sub-navigators (`PatientNavigation`, `NurseNavigation`). This cleanly separates the unauthenticated and authenticated sections of the app. The `gestureEnabled: false` option is a deliberate choice to prevent users from accidentally swiping back to a previous screen in the stack, such as from the dashboard back to the login screen.

**c. Services & Hooks Consumed**
* `NavigationContainer`, `createStackNavigator`: From React Navigation, to create the app's routing structure.
* `TokenProvider`, `PatientProvider`: The app's custom context providers for global state.
* `navigationRef`: The global navigation reference is attached here.

---
### NurseNavigation.js & PatientNavigation.js

**a. Overview**
These two files define the primary navigation structures for authenticated 'nurse' and 'patient' users, respectively. Both are built using a `BottomTabNavigator` to provide a familiar tab-based interface for each user role.

**b. Core Logic & Design Decisions**
* **Custom Tab Bar**: Both navigators use the `tabBar` prop to render a custom component (`NurseNavbar` or `PatientNavbar`) instead of the default React Navigation tab bar.
    * **Rationale**: This is the standard method for replacing the default UI with a fully custom, branded navigation bar that matches the application's aesthetic.
* **Screen Registration**: Each navigator contains a flat list of all `Tab.Screen` components available to that user role.
    * **Rationale**: The navigator is structured as a single `Tab.Navigator` that contains both the primary tab screens (like `Dashboard`) and the secondary screens that are navigated to from them (like `MediaPlayerScreen`). This keeps all screens for a given user role encapsulated within a single navigator file.

---
### NavRef.js

**a. Overview**
A simple utility module that creates and exports a global reference to the root `NavigationContainer`.

**b. Core Logic & Design Decisions**
* **`React.createRef()`**: This creates a reference object that can be attached to a component to gain imperative access to it.
* **Rationale**: This is the standard React Navigation pattern for **enabling navigation from outside of a React screen component**. Services like `FetchWithAuth.js` do not have access to the `navigation` prop. By importing this `navigationRef`, they can dispatch global navigation actions, such as resetting the entire app back to the `Login` screen when a user's session fully expires. This is a crucial piece of the app's architecture for robustly handling authentication state changes.

---

## Part III Section I: Screens & Features of the *Login Directory*

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

---
## PasswordRecovery.js

**a. Overview**
A single-purpose screen that allows users to request a password reset link. It collects the user's email address, performs basic client-side validation, and sends the request to the backend. The feedback provided to the user is intentionally generic to enhance security.

**c. State Management & Rationale**

| State Variable / Context | Type | Role & Rationale |
| :--- | :--- | :--- |
| **Local State** | | |
| `email` | `string` | **Rationale**: This state holds the value of the email input field, making it a controlled component. |

**d. Core Logic & Design Decisions**
The core logic is contained within the `handlePasswordRecovery` function, which is designed to be secure and provide clear user feedback.

* **Client-Side Validation**:
    * **Action**: Before making an API call, the entered email is trimmed, converted to lowercase, and validated against a regex.
    * **Rationale**: This provides instant feedback to the user for invalid email formats, preventing unnecessary and malformed requests from being sent to the server.
* **API Call & Response Handling**:
    * **Action**: A request is sent to the backend to initiate the password reset flow. The function specifically handles different HTTP status codes to provide appropriate feedback.
    * **Rationale**: The success message is deliberately vague ("If an account exists...") to prevent account enumeration, a key security consideration. It also interprets the `429` status from the server's rate-limiter to give the user a clear and actionable error message.
    * **Endpoint**: `POST /users/password-reset/`
    * **Request Body**:
      ```json
      {
        "email": "user@example.com"
      }
      ```
    * **Success Response (200)**:
      ```json
      {
        "message": "If that account exists, a password reset link has been sent."
      }
      ```
    * **Error Response (429 - Rate Limited)**:
      ```json
      {
        "message": "Too many requests for this account. Try again later."
      }
      ```

**e. Services & Hooks Consumed**
* **`useNavigation`**: Used to provide the "Back to Login" functionality.
* **`CustomInput.js`**: The reusable input component used for the email field.

---

## Part III Section II:  Screens & Features of the *Nurse Directory*

This section documents the screens that are exclusively available to the 'nurse' user role, focusing on patient management and administration.


---
## AccountCreation.js

**a. Overview**
This screen provides authenticated nurses with a form to create new patient accounts. It clearly displays the required username and password rules to guide the nurse and performs comprehensive client-side validation before submitting the data to the backend, ensuring a smooth and efficient workflow.

**b. Component Composition**
* **`LinearGradient`**: Provides the signature branded background for the screen.
* **`ValidationRules`**: A sub-component that is always visible and lists the specific character, length, and complexity requirements for usernames and passwords.
* **`CustomInput`**: Reusable components used for the email, username, and password form fields.

**c. Visual Flow & UI States**
The screen primarily exists in a single state, presenting the form and validation rules to the nurse.
1.  **Form Entry State**: The default state, where the nurse can fill in the patient's details. The account requirements are always visible above the form for easy reference.
2.  **Submitting State**: When the "Create" icon is tapped, the `submitting` state becomes `true`. This visually disables the submit icon by changing its color, providing feedback that the request is in progress and preventing duplicate submissions.

**d. State Management & Rationale**

| State Variable / Context | Type | Role & Rationale |
| :--- | :--- | :--- |
| **Local State** | | |
| `email`/`username`/etc. | `string` | **Rationale**: Four state variables to hold the input values for the form fields, making them controlled components. |
| `submitting` | `boolean` | **Rationale**: This state is used to provide immediate UI feedback during the API call. It disables the submit button to prevent accidental multiple account creations for the same patient. |

**e. Core Logic & Design Decisions**
The core of the screen is the `handleSubmit` function, which is designed to validate data thoroughly on the client side before making an authenticated request.

* **Client-Side Validation**:
    * **Action**: Before any network activity, the function performs a series of detailed checks on the form data. This includes validating the email format, username length/characters, and password complexity (requiring uppercase, digit, and special character).
    * **Rationale**: This validation was deliberately made to mirror the stricter rules on the backend. This provides the nurse with immediate, specific feedback, significantly reducing the chance of a failed submission and improving their workflow.
* **API Call**:
    * **Action**: After passing client-side validation, the function uses `fetchWithAuth` to send the new patient's data to the registration endpoint.
    * **Rationale**: `fetchWithAuth` is used to ensure the request is authenticated with the currently logged-in nurse's credentials, which is required by the backend to associate the new patient with the correct hospital. The function also correctly handles specific HTTP response codes like `201`, `400`, and `429` (rate-limiting) to provide tailored feedback for each outcome.
    * **Endpoint**: `POST /users/patient/register/`
    * **Request Body**:
      ```json
      {
        "email": "new.patient@example.com",
        "username": "newpatient123",
        "password": "ValidPassword1!",
        "password2": "ValidPassword1!"
      }
      ```
    * **Success Response (201)**:
      ```json
      {
        "id": 123,
        "message": "Registration successful"
      }
      ```
    * **Error Response (400 - Validation Error)**:
      ```json
      {
        "message": "This username is already taken. Please choose a different one.",
        "errors": {
          "username": ["This username is already taken. Please choose a different one."]
        }
      }
      ```

**f. Services & Hooks Consumed**
* **`useFetchWithAuth`**: Used to make the authenticated API call to create the patient account.
* **`CustomInput.js`**: The reusable component used for all form fields.

---
## PatientLookup.js

**a. Overview**
This screen serves as the primary interface for nurses to find patients. It provides a search form with two distinct modes—by Name/Email or by ID—and displays the results in a list. It is designed to provide clear feedback to the user during the search process and upon finding no results.

**b. Visual Flow & UI States**
The screen's central area transitions between three states based on search activity.
1.  **Initial State**: Before a search is performed, the area below the search bar is empty.
2.  **Loading State**: When a search is initiated (`isLoading` is true), the results area is populated with several `PatientListItemSkeleton` components, providing immediate visual feedback that data is being fetched.
3.  **Results State**: After the search completes, the skeletons are replaced. If patients were found, a `FlatList` of tappable patient items is displayed. If no patients were found, a "No patients found..." message is displayed instead.

**c. State Management & Rationale**

| State Variable / Context | Type | Role & Rationale |
| :--- | :--- | :--- |
| **Local State** | | |
| `searchQuery` | `string` | **Rationale**: This holds the text entered by the nurse in the search input, making it a controlled component. |
| `patients` | `Array` | **Rationale**: Stores the array of patient objects returned from the backend API search. |
| `searchBy` | `string` | **Rationale**: Holds the current search mode ('text' or 'id'). This is used to change the input placeholder text and to send the correct parameter to the backend. |
| `isLoading` | `boolean` | **Rationale**: Controls the visibility of the skeleton loaders during an active API call, providing user feedback. |
| `searchAttempted` | `boolean` | **Rationale**: A crucial flag that differentiates between the initial "no results" state (before any search) and the "no results found" state after a search has been completed. This allows for more precise user feedback. |

**d. Core Logic & Design Decisions**
The component's logic is centered around fetching and displaying search results based on the selected mode.

* **`handleSearchByChange` Function**:
    * **Action**: Triggered when the nurse switches between "Name / Email" and "ID" search modes. It updates the `searchBy` state and clears the `searchQuery` and `patients` list.
    * **Rationale**: This provides a clean user experience by resetting the form, preventing the nurse from accidentally searching for a text query in ID mode or seeing stale results from a previous search.
* **`searchPatients` Function**:
    * **Action**: This function is called when the search button is tapped. It sets the loading state, makes the API call, and sets the results or clears the list upon completion.
    * **Rationale**: It uses the `getJSON` helper from `useFetchWithAuth` to ensure the request is authenticated. The logic is wrapped in a `try...finally` block to guarantee the `isLoading` state is always reset.
    * **Endpoint**: `GET /users/patients-list/`
    * **Request Parameters**: The function sends the query and search type as URL query parameters.
      * Example: `/users/patients-list/?searchBy=text&query=John`
      * Example: `/users/patients-list/?searchBy=id&query=123`
    * **Success Response (200 - with results)**:
      ```json
      [
        {
          "id": 123,
          "username": "JohnDoe",
          "email": "john.doe@example.com"
        }
      ]
      ```
    * **Success Response (200 - no results)**:
      ```json
      []
      ```
    * **Error Response (400 - Invalid ID)**:
      ```json
      {
        "error": "Invalid ID format."
      }
      ```
* **`handleUserClick` Function**:
    * **Action**: Triggered when a nurse taps a patient in the results list. It navigates to the `PatientDetails` screen.
    * **Rationale**: Following our recent refactor, this function's sole responsibility is navigation. It passes only the patient's essential identifiers (`id`, `username`, `email`), decoupling this screen from the `PatientDetails` screen's data-fetching logic.

**e. Services & Hooks Consumed**
* **`useNavigation`**: Used to navigate to the `PatientDetails` screen.
* **`useFetchWithAuth`**: Used to make the authenticated API call to search for patients.
* **`PatientListItemSkeleton`**: The sub-component used to display the loading state.

---
### PatientDetails.

**a. Overview**
A read-only screen for nurses to view a specific patient's profile information and their recent activity, visualized in a graph. The screen is self-sufficient, receiving a patient `id` via navigation and fetching all its own detailed data. It displays a loading state with skeleton placeholders while fetching data.

**b. Visual Flow & UI States**
The screen has three distinct states, providing clear feedback to the nurse.
1.  **Loading State**: On initial render, while `isLoading` is `true`, the screen displays dedicated skeleton placeholders for both the patient info card and the activity graph area.
2.  **Error State**: If the data fetch fails, the `error` state is populated, and a simple error message is displayed to the user.
3.  **Success State**: Once data is successfully fetched, the skeletons are replaced with the `PatientInfoCard` and the `Graph` component, showing the patient's real-time data.

**c. State Management & Rationale**

| State Variable / Context | Type | Role & Rationale |
| :--- | :--- | :--- |
| **`route.params`** | `object` | **Rationale**: Receives the patient's `id`, `username`, and `email`. The `id` is essential for the API call, while `username` and `email` are used immediately in the `PatientInfoCard`. |
| `detailsData` | `object` | **Rationale**: Stores the detailed graph and activity data fetched from the API. It is initialized as `null` and populated upon a successful fetch. |
| `isLoading` | `boolean` | **Rationale**: A crucial flag that controls the conditional rendering of the UI, allowing the screen to show a `PatientDetailsSkeleton` and `GraphSkeleton` during the data fetch. |
| `error` | `string` | **Rationale**: Stores any error message from the data fetch, allowing the screen to display a user-friendly error state instead of crashing. |

**d. Core Logic & Design Decisions**
The component's logic is now centered around fetching its own data in a self-contained manner.

* **`useEffect` Hook**:
    * **Action**: This is the core of the component's logic. It triggers the `fetchPatientDetails` function when the component mounts (or if the patient `id` ever changes).
    * **Rationale**: This hook is the key to making the component self-sufficient and decoupled. By fetching its own data, the component is not reliant on the screen that navigated to it, making it more reusable and easier to maintain.
* **API Call (`fetchPatientDetails`)**:
    * **Action**: Uses the `getJSON` helper from `useFetchWithAuth` to fetch data and populate the `detailsData` state.
    * **Rationale**: The logic is wrapped in a `try...catch...finally` block. This is a robust pattern that ensures the `isLoading` state is always correctly set to `false`, even if the API call fails, preventing the UI from being stuck in a permanent loading state.
    * **Endpoint**: `GET /users/patient-graph/{id}/`
    * **Request Parameters**: The patient's `id` is passed as a dynamic segment in the URL path.
    * **Success Response (200)**:
      ```json
      {
        "weekData": {
          "mon": 2, "tues": 1, "wed": 3, "thur": 0, "fri": 1, "sat": 4, "sun": 2,
          "week": 13,
          "all_time": 152
        }
      }
      ```
    * **Error Response (404)**:
      ```json
      {
        "error": "Patient not found for this hospital."
      }
      ```

**e. Services & Hooks Consumed**
* **`useRoute`**: From React Navigation, used to access the `id`, `username`, and `email` passed as parameters.
* **`useFetchWithAuth`**: The application's custom hook for making authenticated API calls.
* **`PatientInfoCard.js`**: The reusable component for displaying basic patient information.
* **`Graph.js`**: The reusable component for visualizing activity data.
* **`PatientDetailsSkeleton.js`**: The placeholder for the patient info card during loading.
* **`GraphSkeleton.js`**: The placeholder for the graph during loading.

---
## NurseSettings.js

**a. Overview**
A simple container screen that provides the nurse with access to application settings and actions. It achieves its functionality by composing other, self-contained components like `Logout` and `PrivacyPolicy`.

**b. Component Composition**
* **`LinearGradient`**: Provides the signature branded background for the screen.
* **`Logout.js`**: The component that renders the logout button and contains all the logic for securely ending the user's session.
* **`PrivacyPolicy.js`**: The component that renders the button to open the full-screen privacy policy modal.

**c. Core Logic & Design Decisions**
* **Compositional Design**:
    * **Action**: This screen renders other components that contain their own logic, rather than implementing any logic itself.
    * **Rationale**: This is a deliberate design choice to keep the screen component simple and focused only on layout. All complex functionality (like logging out) is encapsulated within the child components, making the codebase more modular and maintainable.

**d. Services & Hooks Consumed**
* This screen consumes no hooks or services directly. It renders the following components:
    * `Logout.js`
    * `PrivacyPolicy.js`

---

## Part III Section III:  Screens & Features of the *Patient Directory*

This section documents the screens that make up the core patient experience, focusing on daily tasks, educational content, and progress tracking.

---
## Dashboard.js

**a. Overview**
This is the main landing screen for the patient user and the heart of the application experience. **The primary design goal is to provide a consolidated, single-screen view of all daily assigned content**, including educational modules, actionable tasks, a weekly progress graph, and an inspirational quote. It is a complex, data-driven screen architected for performance and data freshness.

**b. Visual Flow & UI States**
The screen has three distinct states to ensure a clear user experience.
1.  **Loading State**: On initial load or when a refresh is triggered, the `loading` state is `true`. The screen displays skeleton placeholders for each content section (`ModuleSkeleton`, `GraphSkeleton`, `QuoteSkeleton`). **The rationale is to provide immediate visual feedback** that content is being fetched, improving perceived performance.
2.  **Error State**: If the `fetchDashboardData` call fails, the `error` state is populated, and the entire screen is replaced with a simple "Failed to load dashboard data" message.
3.  **Success State**: When `loading` is `false` and there is no `error`, the skeletons are replaced with the actual components (`ModuleCard`, `Graph`, `QuoteCard`), populated with the data fetched from the server.

**c. State Management & Rationale**

| State Variable / Context | Type | Role & Rationale |
| :--- | :--- | :--- |
| **Consumed Context** | | |
| `refresh`, `date` | `boolean`, `number` | From `PatientContext`. **Rationale**: These values form a powerful and efficient data-freshness strategy. The `useFocusEffect` hook checks these values to determine if a data refetch is necessary, either due to a manual trigger (`refresh`) or the start of a new day (`date`). |
| **Local State** | | |
| `dashboardData`, etc. | `Array`/`string` | **Rationale**: Multiple state variables (`dashboardData`, `taskModuleData`, `quote`, `weeklyData`, `dailyData`) are used to cleanly separate and store the different types of content returned from the aggregated dashboard API endpoint. |
| `loading` / `error` | `boolean` / `string` | **Rationale**: Standard state variables to manage the component's lifecycle during an asynchronous data fetch, enabling the distinct visual states (Loading, Error, Success). |
| `graphKey` | `number` | **Rationale**: This state is used as a `key` prop on the `Graph` component. It is incremented after each data fetch to force React to completely re-mount the component. This is a deliberate design choice to prevent potential rendering bugs within the third-party `victory-native` charting library. |

**d. Core Logic & Design Decisions**
The component's logic is centered around efficiently fetching and displaying daily content, handling data freshness, and processing user interactions.

* **`useFocusEffect` (Data Refresh Logic)**:
    * **Action**: This hook runs every time the patient navigates to the dashboard. It contains logic to call `fetchDashboardData` only if the `refresh` flag is true or if the `date` has changed.
    * **Rationale**: This is a highly performant design. It prevents redundant API calls on every screen visit but guarantees data is reloaded when explicitly requested or automatically once per day, ensuring the patient always sees the correct daily information.
* **`fetchDashboardData` (API Call)**:
    * **Action**: This function makes a single `GET` request to the backend to retrieve all data needed for the screen.
    * **Rationale**: The use of a single, aggregated endpoint on the backend is a key performance optimization. It simplifies the frontend logic and reduces network latency by avoiding multiple separate requests for tasks, modules, and quotes.
    * **Endpoint**: `GET /users/dashboard/`
    * **Success Response (200)**:
      ```json
      {
        "generalVideos": [
          {"id": 1, "url": "https://...", "title": "Breathing Exercises", "description": "...", "isCompleted": false, "icon": "videocam-outline", "media_type": "video"}
        ],
        "tasks": [
          {"id": 1, "name": "Walk for 5 minutes", "description": "...", "isCompleted": false, "icon": "walk-outline"}
        ],
        "quote": {
          "id": 1,
          "quote_text": "Recovery is not a race..."
        },
        "weekData": {
          "mon": 2, "tues": 1, "wed": 3, "thur": 0, "fri": 1, "sat": 4, "sun": 2,
          "week": 13,
          "all_time": 152
        }
      }
      ```
    * **Error Response**: No specific error body is defined; it will fall back to a generic error message.

* **`handleTask` (Task Completion)**:
    * **Action**: This function is called when a user taps on a task `ModuleCard`. It sends a `POST` request to the backend to mark the task as complete.
    * **Rationale**: Upon a successful API response, it performs an **optimistic UI update** by updating the local `taskModuleData` state directly, rather than re-fetching all dashboard data. This makes the UI feel instantaneous to the user.
    * **Endpoint**: `POST /users/tasks/update-completion/{taskId}/`
    * **Request Body**: *None*
    * **Success Response (200)**:
      ```json
      {
        "message": "Task completion status updated successfully."
      }
      ```
    * **Error Response (404)**:
      ```json
      {
        "error": "Assigned task not found for this user."
      }
      ```

**e. Services & Hooks Consumed**
* **`useFocusEffect`**, **`useNavigation`**: For handling screen focus events and navigation.
* **`PatientContext`**: To access and manage the global `refresh` and `date` flags for data freshness.
* **`useFetchWithAuth`**: For making all authenticated API calls.
* **`ModuleCard`**, **`Graph`**, **`QuoteCard`**: Reusable components for displaying content.
* **`ModuleSkeleton`**, **`GraphSkeleton`**, **`QuoteSkeleton`**: Reusable components for the loading state.

---
## AssortedCategories.js

**a. Overview**
This screen serves as the main entry point to the patient's general content library. It fetches and displays a list of top-level module categories (e.g., "Pre-Surgery," "Post-Surgery"). **The component is architected for performance and a seamless user experience**, utilizing a cache-first data strategy and a standard pull-to-refresh mechanism.

**b. Visual Flow & UI States**
The screen provides clear feedback to the user throughout the data fetching lifecycle.
1.  **Initial Loading State**: On first launch (with an empty cache), the `loading` state is true, and the screen displays a list of `AssortedSkeleton` placeholders.
2.  **Success State**: Once categories are fetched (from cache or network), the skeletons are replaced with a `FlatList` of tappable category items, each showing the category name and an icon.
3.  **Empty / Error State**: If no categories are available or a network error occurs, the `ListEmptyComponent` of the `FlatList` displays a relevant message to the user.
4.  **Refreshing State**: When the user pulls the list down, a native `RefreshControl` spinner appears at the top while new data is fetched from the server.

**c. State Management & Rationale**

| State Variable / Context | Type | Role & Rationale |
| :--- | :--- | :--- |
| **Local State** | | |
| `categories` | `Array` | **Rationale**: Stores the list of category objects fetched from the cache or API, which serves as the primary data source for the `FlatList`. |
| `loading` | `boolean` | **Rationale**: Controls the initial loading state. It is used by the `ListHeaderComponent` to render skeleton placeholders before any data is available. |
| `error` | `string` | **Rationale**: Stores any error message from the data fetch, allowing the `ListEmptyComponent` to display a user-friendly error state if the API call fails. |
| `isRefreshing` | `boolean` | **Rationale**: This state is dedicated to controlling the visibility of the native `RefreshControl` spinner. It is managed separately from the main `loading` state to distinguish between an initial load and a manual pull-to-refresh action. |

**d. Core Logic & Design Decisions**
The component's logic is optimized for performance by prioritizing cached data and giving the user manual control over data freshness.

* **`fetchCategories` (Cache-First Logic)**:
    * **Action**: The primary data-fetching function. It first checks `CacheManager.isCacheStale()`. If the global cache is stale, it is busted. The function then attempts to get the data from the cache first (`CacheManager.get()`). A network call is only made if the data is not found in the cache.
    * **Rationale**: This "cache-first" strategy provides an instantaneous loading experience on subsequent visits. It minimizes network requests, saving data and improving performance, while the global 12-hour timer in the `CacheManager` ensures the data is eventually refreshed.
    * **Endpoint**: `GET /users/categories/`
    * **Success Response (200)**:
      ```json
      {
        "categories": [
          {
            "id": 1,
            "category": "Pre-Surgery Preparation",
            "icon": "medkit-outline"
          },
          {
            "id": 2,
            "category": "Post-Surgery Recovery",
            "icon": "walk-outline"
          }
        ]
      }
      ```
    * **Error Response**: No specific error body is defined; it will fall back to a generic error message.

* **`onRefresh` (Pull-to-Refresh)**:
    * **Action**: A memoized function passed to the `FlatList`'s `RefreshControl`. It calls `CacheManager.bustAndResetCache()` and then re-triggers `fetchCategories`.
    * **Rationale**: This provides users with a standard, intuitive gesture to manually override the 12-hour cache and force a fetch of the latest content from the server.

* **`FlatList` Rendering**:
    * **Action**: The screen uses `FlatList` to render the list of categories.
    * **Rationale**: This is a key performance optimization. `FlatList` virtualizes its rows, meaning it only renders items currently visible on the screen. This ensures the component remains fast and responsive even if the number of categories grows significantly.

**e. Services & Hooks Consumed**
* **`useNavigation`**: For navigating to the `AssortedSubcategories` screen when a category is tapped.
* **`useFetchWithAuth`**: For making authenticated API calls.
* **`CacheManager.js`**: The service used for all caching operations (checking staleness, busting, getting, and setting).
* **`AssortedSkeleton.js`**: The component used to render the loading state.

---
## AssortedSubcategories.js

**a. Overview**
This screen serves as the second level of the patient's content library. It receives a `categoryId` from the previous screen and displays a list of all relevant subcategories. **It is architected for performance, reusing the same cache-first data fetching strategy** as the `AssortedCategories` screen to provide a fast and seamless drill-down experience for the user.

**b. Visual Flow & UI States**
The screen provides clear visual feedback throughout its lifecycle.
1.  **Loading State**: When `loading` is true, the list area displays several `AssortedSkeleton` placeholders.
2.  **Success State**: Once data is loaded from cache or the network, the skeletons are replaced by a `FlatList` of tappable subcategory items.
3.  **Empty / Error State**: If the fetch completes and there are no subcategories, or if an error occurred, the `ListEmptyComponent` displays an appropriate message to the user.

**c. State Management & Rationale**

| State Variable / Context | Type | Role & Rationale |
| :--- | :--- | :--- |
| **`route.params`** | `object` | **Rationale**: Receives `categoryName` and `categoryId` from the previous screen. `categoryName` is used for the title, and `categoryId` is essential for the dynamic cache key and API endpoint. |
| `subcategories` | `Array` | **Rationale**: Stores the array of subcategory objects fetched from the cache or API, which is the data source for the `FlatList`. |
| `loading` | `boolean` | **Rationale**: Controls the visibility of the initial skeleton placeholders in the `ListHeaderComponent`, providing feedback during data fetching. |
| `error` | `string` | **Rationale**: Stores any error message, allowing the `ListEmptyComponent` to display a user-friendly error state. |

**d. Core Logic & Design Decisions**
The component's logic is centered on fetching and displaying a cached, dynamic list of subcategories.

* **`useFocusEffect` Hook**:
    * **Action**: Triggers the `fetchSubcategories` function every time the screen comes into focus.
    * **Rationale**: This ensures the data is always evaluated against the cache rules upon viewing, providing data freshness without unnecessary re-renders.
* **`fetchSubcategories` (Cache-First Logic)**:
    * **Action**: This function first checks the `CacheManager` for valid data using a dynamic key (e.g., `assorted_subcategories_1`). A network call is only made if cached data is not found or is stale.
    * **Rationale**: This extends the performant caching strategy to the second level of the content library, making the drill-down navigation feel instantaneous for the user.
    * **Endpoint**: `GET /users/{categoryId}/subcategories/`
    * **Success Response (200)**:
      ```json
      {
        "subcategories": [
          {
            "id": 10,
            "subcategory": "Diet and Nutrition"
          },
          {
            "id": 11,
            "subcategory": "Medication Guide"
          }
        ]
      }
      ```
    * **Error Response (404)**:
      ```json
      {
        "error": "Category not found for this hospital."
      }
      ```

**e. Services & Hooks Consumed**
* **`useNavigation`**, **`useRoute`**, **`useFocusEffect`**: For navigation, accessing parameters, and handling screen focus events.
* **`useFetchWithAuth`**: For making authenticated API calls.
* **`CacheManager.js`**: The service used for all caching operations.
* **`AssortedSkeleton.js`**: The component used to render the loading state.

---
## MediaPlayer.js

**a. Overview**
A unified, multi-purpose screen that serves as the single media player for the entire application. It can dynamically render either a video or an audio player based on props. **Its behavior is controlled by a `mode` parameter, allowing it to function either as a completable daily module (`'dashboard'` mode) or as a general content viewer (`'library'` mode)**. The component is architected for robustness with proactive URL validation and a user-friendly retry mechanism for network errors.

**b. Visual Flow & UI States**
The screen provides clear visual feedback throughout the media loading and playback process.
1.  **Validating Media State**: On initial load, a loading indicator is displayed while the component performs a `HEAD` request to validate the media URL.
2.  **Media Error State**: If the URL validation or playback fails, the player area is replaced with a specific error message and a "Retry" button appears in the top bar, allowing the user to attempt to reload the media.
3.  **Media Loaded State**: Once the URL is validated, the appropriate media player (`VideoPlayer` or `AudioPlayer`) is rendered. In `'dashboard'` mode, the "Mark Complete" button is visible and enabled.
4.  **Completion State** (`dashboard` mode only): After the user completes the module, a confetti animation is displayed for 3 seconds before the user is automatically navigated back to the Dashboard.

**c. State Management & Rationale**

| State Variable / Context | Type | Role & Rationale |
| :--- | :--- | :--- |
| **`route.params`** | `object` | **Rationale**: Receives all necessary data, including `videoUrl`, `videoTitle`, and crucially, the `mode` ('dashboard' or 'library'), which dictates the component's primary behavior. |
| **Consumed Context** | | |
| `setRefresh` | `function` | From `PatientContext`. **Rationale**: Called in `'dashboard'` mode upon successful completion to signal to the `Dashboard` that it must refetch its data. |
| **Local State** | | |
| `mediaLoading` | `boolean` | **Rationale**: Controls the visibility of the initial "Validating Media..." indicator during the `HEAD` request. |
| `mediaError` | `string` | **Rationale**: Stores a user-friendly error message if validation or playback fails. Its presence also controls the visibility of the "Retry" button. |
| `confettiVisible`| `boolean` | **Rationale**: A flag to trigger the confetti animation, providing a positive reward to the user upon completion in `'dashboard'` mode. |
| `submitted.current`| `boolean` | (`useRef`) **Rationale**: A guard to prevent the `handleComplete` function from being called multiple times. `useRef` is used to avoid unnecessary re-renders. |

**d. Core Logic & Design Decisions**
The component's logic is designed to be resilient, reusable, and provide a clear, rewarding workflow.

* **`useEffect` & `validateMediaUrl` (URL Validation)**:
    * **Action**: On mount, the `useEffect` hook calls `validateMediaUrl`, which performs a `HEAD` request to the media URL.
    * **Rationale**: This proactive error-handling strategy confirms the URL is valid and reachable *before* loading the full media player. This allows for more specific error messages and a better user experience.
* **`handleRetry` Function**:
    * **Action**: This function is called when the "Retry" button (visible only on error) is pressed. It simply re-triggers the `validateMediaUrl` function.
    * **Rationale**: This provides a crucial recovery path for users who experience temporary network errors, preventing them from being permanently stuck in an error state.
* **`handleComplete` Function (`dashboard` mode only)**:
    * **Action**: Marks the module as complete. It is called either automatically by the player's `onFinish` event or manually when the user presses the checkmark button.
    * **Rationale**: The function is heavily guarded to prevent redundant API calls. Upon success, it triggers the confetti and sets the global `refresh` flag before navigating, creating a clear and rewarding completion loop for daily tasks.
    * **Endpoint**: `POST /users/update_video_completion/{videoId}/`
    * **Request Body**:
      ```json
      {
        "isCompleted": true
      }
      ```
    * **Success Response (200)**:
      ```json
      {
        "message": "Video completion status updated successfully."
      }
      ```
    * **Error Response (404)**:
      ```json
      {
        "error": "Assigned video not found for this user."
      }
      ```

**e. Services & Hooks Consumed**
* **`useNavigation`**, **`useRoute`**: To control navigation and access parameters.
* **`useFetchWithAuth`**: For making the authenticated API call to mark the module as complete.
* **`PatientContext`**: To signal a refresh back to the `Dashboard` screen.
* **`VideoPlayer.js`** / **`AudioPlayer.js`**: The reusable components used to render the media.
* **`react-native-confetti-cannon`**: A third-party library used for the completion celebration effect.

---
## PatientSettings.js

**a. Overview**
This screen serves as the central hub for patient account management. It allows an authenticated patient to view their profile information, change their password, and securely delete their account. It also provides access to application-wide features like the privacy policy and logout function by composing other reusable components.

**b. Visual Flow & UI States**
The screen has several distinct states to handle its various functions.
1.  **Initial Loading State**: On first load, the `loading` state is true, and the "Your Information" section displays a `PatientDetailsSkeleton` placeholder while fetching the user's data.
2.  **Default State**: Once data is loaded, the screen displays all functional sections: the populated `PatientInfoCard`, the "Change Password" form, and buttons for "Logout" and "Delete Account".
3.  **Password Change Loading State**: When the user submits a new password, the `isChangingPassword` state becomes true, which disables the "Change Password" button and reduces its opacity to provide feedback.
4.  **Delete Confirmation State**: Tapping the "Delete Account" button sets `showDeleteModal` to true, which displays a full-screen modal. This modal requires the user to enter their current password to confirm the destructive action.

**c. State Management & Rationale**

| State Variable / Context | Type | Role & Rationale |
| :--- | :--- | :--- |
| **Consumed Context** | | |
| `setUserType` | `function` | From `TokenContext`. **Rationale**: This is used to clear the global authentication state after a successful account deletion, effectively logging the user out. |
| **Local State** | | |
| `username`/`id`/`email` | `string` | **Rationale**: These state variables store the user's profile information after it is fetched from the server, used to populate the `PatientInfoCard`. |
| `loading` | `boolean` | **Rationale**: Manages the initial data fetch, controlling the visibility of the `PatientDetailsSkeleton` to provide user feedback. |
| `oldPassword`/`newPassword`/etc. | `string` | **Rationale**: Three separate state variables to control the inputs of the "Change Password" form. |
| `isChangingPassword`| `boolean` | **Rationale**: Provides UI feedback and prevents double-submissions for the password change feature, separate from the initial page load state. |
| `showDeleteModal` | `boolean` | **Rationale**: Controls the visibility of the account deletion confirmation modal, providing a crucial step to prevent accidental deletion. |
| `deletePassword` | `string` | **Rationale**: A controlled input for the password field inside the deletion modal, required for re-authentication before a destructive action. |

**d. Core Logic & Design Decisions**
The component's logic is segmented into distinct, secure functions for each primary feature.

* **`useEffect` (Initial Data Fetch)**:
    * **Action**: Triggers the `fetchSettingsData` function when the component first mounts.
    * **Rationale**: This ensures the user's information is always fresh from the server when they visit the settings page.
    * **Endpoint**: `GET /users/user-settings/`
    * **Success Response (200)**:
      ```json
      {
        "id": 123,
        "username": "patient_username",
        "email": "patient@example.com"
      }
      ```

* **`handleChangePassword` Function**:
    * **Action**: Performs client-side validation, then sends the old and new passwords to the backend. It provides specific user feedback based on the API response.
    * **Rationale**: The validation and loading state provide a clear and robust user experience, guiding the user through the process and preventing accidental clicks.
    * **Endpoint**: `POST /users/change-password/`
    * **Request Body**:
      ```json
      {
        "old_password": "current_password1",
        "new_password": "NewValidPassword1!"
      }
      ```
    * **Success Response (200)**:
      ```json
      {
        "message": "Password changed successfully"
      }
      ```
    * **Error Response (400)**:
      ```json
      {
        "error": "Old password is incorrect"
      }
      ```

* **`deleteAccount` Function**:
    * **Action**: This function is called from within the confirmation modal. It sends the user's password to the backend for verification before deleting the account.
    * **Rationale**: This is a critical security feature. **Requiring password re-authentication before a destructive action** is a best practice that ensures the legitimate user is making the request. Upon success, it securely logs the user out by clearing all local tokens and resetting the navigation stack.
    * **Endpoint**: `POST /users/delete-account/`
    * **Request Body**:
      ```json
      {
        "password": "current_password1"
      }
      ```
    * **Success Response (204 No Content)**: The response has no body, but triggers a full logout and navigation reset on the client.
    * **Error Response (403 Forbidden)**:
      ```json
      {
        "detail": "Incorrect password."
      }
      ```

**e. Services & Hooks Consumed**
* **`useNavigation`**: To control navigation, specifically to reset the app to the `Login` screen after account deletion.
* **`useFetchWithAuth`**: For all authenticated API calls (fetching settings, changing password, deleting account).
* **`TokenContext`**: To clear the global user type upon deletion.
* **`Memory.js`**: Specifically, the `clearTokens` function is used for a secure logout after account deletion.
* **`PatientInfoCard.js`**, **`PatientDetailsSkeleton.js`**, **`CustomInput.js`**, **`PrivacyPolicy.js`**, **`Logout.js`**: Reusable components that make up the screen's UI and functionality.



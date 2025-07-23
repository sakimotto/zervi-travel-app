# Project Prompt Template for React Applications

Use this template when requesting new React applications to ensure consistent, high-quality results.

## Base Requirements

```
Create a React application with the following specifications:

1. Tech Stack:
   - React with TypeScript
   - Tailwind CSS for styling
   - Lucide React for icons
   - File-saver for export functionality

2. Data Storage:
   - Implement localStorage persistence
   - Include save/load/reset functionality
   - Add export/import capabilities via JSON files
   - Enable "save as default" feature for cross-device consistency

3. UI Requirements:
   - Responsive design that works on mobile and desktop
   - Clean, accessible interface with intuitive navigation
   - Search/filter capabilities for data lists
   - Modal dialogs for add/edit functionality
   - Form validation for user inputs
   - Consistent error handling with user feedback

4. Architecture:
   - Component-based structure with proper separation of concerns
   - TypeScript types/interfaces for all data entities
   - Utility functions for common operations
   - Clear file organization (components, data, types, utils)

5. Sample Data:
   - Include realistic placeholder data
   - Make sample data easily replaceable
```

## Customization Section

Add specific requirements for your project after the base template:

```
Customize this application for [YOUR SPECIFIC USE CASE]:

1. Primary Features:
   - [Feature 1]
   - [Feature 2]
   - [Feature 3]

2. Data Structure:
   - [Entity 1] with fields: [list of fields]
   - [Entity 2] with fields: [list of fields]

3. User Flows:
   - [Describe key user journey 1]
   - [Describe key user journey 2]

4. Design Preferences:
   - Color scheme: [primary], [secondary], [accent]
   - Style references: [links or descriptions]
```

## Example Prompt

```
Create a React application with the following specifications:

1. Tech Stack:
   - React with TypeScript
   - Tailwind CSS for styling
   - Lucide React for icons
   - File-saver for export functionality

2. Data Storage:
   - Implement localStorage persistence
   - Include save/load/reset functionality
   - Add export/import capabilities via JSON files
   - Enable "save as default" feature for cross-device consistency

3. UI Requirements:
   - Responsive design that works on mobile and desktop
   - Clean, accessible interface with intuitive navigation
   - Search/filter capabilities for data lists
   - Modal dialogs for add/edit functionality
   - Form validation for user inputs
   - Consistent error handling with user feedback

4. Architecture:
   - Component-based structure with proper separation of concerns
   - TypeScript types/interfaces for all data entities
   - Utility functions for common operations
   - Clear file organization (components, data, types, utils)

5. Sample Data:
   - Include realistic placeholder data
   - Make sample data easily replaceable

Customize this application for a Recipe Management App:

1. Primary Features:
   - Recipe creation with ingredients, instructions, and photos
   - Recipe categorization and tagging
   - Search by ingredient, category, or name
   - Shopping list generation from recipes

2. Data Structure:
   - Recipe with fields: id, name, description, ingredients, instructions, prepTime, cookTime, servings, category, tags, image
   - Ingredient with fields: id, name, amount, unit

3. User Flows:
   - User browses recipes by category or search
   - User adds/edits their own recipes
   - User selects recipes and generates a shopping list

4. Design Preferences:
   - Color scheme: #4A6FA5 (primary), #FF6B6B (secondary), #FFE66D (accent)
   - Style reference: Modern, clean, with ample white space and food photography
```
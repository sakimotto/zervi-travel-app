# Template Usage Guide

This document explains how to use the Yok's Travel App as a template for developing new applications quickly.

## Project Structure Overview

```
src/
├── components/     # UI components
├── data/           # Sample data and data sources
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── App.tsx         # Main application component
├── main.tsx        # Application entry point
└── index.css       # Global styles
```

## Step 1: Clone and Clean

1. Make a copy of the project:
   ```bash
   cp -r travel-app new-app-name
   cd new-app-name
   ```

2. Update project information:
   - Edit `package.json` with your new app name and description
   - Update `index.html` title and favicon

3. Decide which components to keep:
   - At minimum, keep core utility functions and infrastructure components
   - Core components worth keeping: Modal patterns, search/filter patterns, localStorage logic

## Step 2: Adapt Data Model

1. Modify `src/types.ts` with your new data models:
   - Replace existing types (Destination, ItineraryItem, etc.)
   - Define new interfaces for your application's data

2. Update sample data:
   - Modify files in `src/data/` to include appropriate sample data
   - Update localStorage keys in `utils/localStorage.ts`

3. Refactor utility functions:
   - Adapt `utils/localStorage.ts` for your new data types
   - Update any other utility functions to work with your data model

## Step 3: Modify UI Components

1. Edit `App.tsx` to include only sections relevant to your application:
   - Remove unnecessary components
   - Keep the layout structure and navigation patterns

2. Adapt section components:
   - Begin with components that have structures similar to what you need
   - For example, use `DestinationsSection.tsx` as a template for listing items
   - Use `AddDestinationModal.tsx` as a template for add/edit modals

3. Update the navbar and footer:
   - Change links and sections to match your application's structure
   - Update branding elements

## Step 4: Customize Styling

1. Modify `tailwind.config.js` with your color scheme:
   ```javascript
   theme: {
     extend: {
       colors: {
         primary: '#YOUR_PRIMARY_COLOR',
         secondary: '#YOUR_SECONDARY_COLOR',
         accent: '#YOUR_ACCENT_COLOR',
         // etc.
       }
     }
   }
   ```

2. Update global styles in `index.css` if needed:
   - Adjust font families or base styling
   - Modify any global utility classes

## Step 5: Update Core Functionality

1. Adapt cross-device synchronization:
   - Ensure localStorage keys are unique to your application
   - Preserve the "Save as Default" functionality for cross-device consistency

2. Modify export/import functionality:
   - Update the file naming pattern
   - Ensure validation checks match your data structure

3. Adapt print functionality (if needed):
   - Modify `utils/printItinerary.ts` to work with your data model
   - Update the HTML generation to represent your data appropriately

## Example: Converting to a Recipe App

1. Data model changes:
   - Change `Destination` to `Recipe`
   - Change `ItineraryItem` to `Ingredient`
   - Add new types like `CookingStep` or `Category`

2. Component changes:
   - Rename `DestinationCard` to `RecipeCard`
   - Convert `AddDestinationModal` to `AddRecipeModal`
   - Transform `DestinationsSection` to `RecipesSection`

3. Feature adaptations:
   - Modify filters for recipe categories
   - Change export/import logic for recipe data
   - Update search to look at recipe ingredients and titles

## Key Elements to Preserve

These aspects of the template provide high value and should be maintained:

1. **Cross-device data synchronization** via "Save as Default" functionality
2. **Import/export capabilities** for data portability
3. **Modal patterns** for adding and editing items
4. **Search and filter infrastructure**
5. **Responsive design elements** that work on mobile and desktop
6. **Component architecture** with proper separation of concerns
7. **localStorage utility abstractions** for data persistence

## Best Practices When Using This Template

1. Start with the minimal set of components needed
2. Refactor one component at a time
3. Test on both mobile and desktop viewports
4. Maintain TypeScript type safety throughout
5. Keep the utility functions for data persistence
6. Test the import/export and "Save as Default" functionality early
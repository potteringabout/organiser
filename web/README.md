# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# UI Components

For the UI components, we are using [Tailwind CSS](https://tailwindcss.com/) and [React](https://reactjs.org/).

We will also be using shadcn UI components for the UI. https://ui.shadcn.com/docs/components/

To use Shadcn

## Installation in the project
npx shadcn@latest init

## We can now add components to the project from shadcn UI ( https://ui.shadcn.com/docs/components/ )

Eg.
npx shadcn@latest add input
npx shadcn@latest add button


## Zustand

https://github.com/pmndrs/zustand

It's a state management library for React. The beauty of it is that I now longer need to pass state between components.  I can just use the store in the component that needs it.

I've added a store for the sidebar and the organiser.  I can now use the store in the organiser component and the sidebar component.

## Routing

https://reactrouter.com/en/main/start/overview

I've added a route for the organiser.  I can now navigate to the organiser from the main menu.  The route is /organiser/:boardId

The boardId is passed to the organiser component as a parameter.  I can now use the boardId to fetch the data for the board.

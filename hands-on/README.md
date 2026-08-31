# GitHub Copilot Agents and MCP (training) - Hands-on instructions

> [!NOTE]
> This is an hands-on workshop so it has to be done by the participants. The instructions below are to be used by the workshop participants themselves.

Duration: 45-60 minutes

This document quickly describes the content of the hands-on workshop. It is written for the engineers that is delivering the training.

## Prerequisites

- GitHub account with Copilot access
- An IDE with GitHub Copilot Chat extension
- Access to GitHub Copilot Cloud Agent
- Access to GitHub Copilot Chat in Agent Mode
- Access to MCP servers
- Node.js and npm installed

## Environment configuration

Everything is descripted step by step before each exercise.

## Part 1: GitHub Copilot Cloud Agent (15-20 minutes)

### Exercise 1: Basic Feature Addition

1. Create an issue for adding a "Clear All Favorites" button
2. Use Copilot Cloud Agent to implement the feature by:
   - Assigning the issue to Copilot
   - Checking the 👀 reaction
   - Reviewing the generated PR
   - Understanding the changes made
   - Testing the implementation

### Exercise 2: Feature Enhancement

1. Create an issue to add sorting options for the book list (by title, author)
2. Follow the same process as Exercise 1
3. Review and discuss how Copilot Cloud Agent:
   - Understands the codebase
   - Makes changes across multiple files
   - Implements both frontend and backend changes
   - Adds appropriate tests

### Exercise 3: Complex Feature with Multiple Issues

1. Create three issues for implementing book reviews functionality:
   - Frontend issue: UI components for adding/displaying reviews
   - Backend issue: API endpoints and database changes for reviews
   - Main feature issue: Link to both frontend and backend issues
2. Use the MCP server for Copilot Cloud Agent
3. Assign the main issue to Copilot:
   - Ensure Copilot
   - Watch how Copilot:
     * Has access to read linked issues
     * Reads and understands linked issues
     * Coordinates frontend and backend changes
     * Implements the complete feature
4. Review the generated PR and validate:
   - Frontend changes match the requirements
   - Backend API implementation
   - Test coverage for both layers
   - Integration between components

## Part 2: GitHub Copilot Chat Agent Mode with MCP (15-20 minutes)

### Exercise 4: Implementing Book Search

1. Open VS Code with Agent Mode enabled
2. Use Chat Agent Mode to implement a search feature in the books list that:
   - Allows users to search books by title or author
   - Adds a search input field in the UI
   - Filters the book list in real-time
   - Includes clear search functionality

### Exercise 5: Adding Book Categories

1. Use the GitHub MCP server to create an issue to describe the feature request
2. Have Copilot:
   - Create a detailed issue description
   - Suggest implementation approach in the issue
3. Implement the feature following the issue guidelines
4. Explore how Chat Agent Mode:
   - Creates well-structured issues
   - Handles the implementation
   - Adds necessary tests

## Part 3: GitHub Copilot CLI (15-20 minutes)

> Detailed instructions: [03-copilot-cli-exercises.md](./03-copilot-cli-exercises.md)

### Exercise 6: Install and Authenticate GitHub Copilot CLI

1. Install the CLI via npm, WinGet, or Homebrew
2. Start an interactive session and authenticate with GitHub
3. Run a warm-up question to confirm the CLI is reading the repository

### Exercise 7: Explore the Codebase

1. Use the CLI to trace the JWT authentication flow end-to-end
2. Ask about the favorites feature and its data flow
3. Try non-interactive mode (`-p`, `-s`) and file attachment with `@`

### Exercise 8: Add a Feature Using Plan Mode

1. Use **Shift+Tab** to activate plan mode
2. Prompt Copilot to add a `/books/search` endpoint and tests
3. Review the generated plan before approving
4. Let Copilot implement the feature and run the test suite

### Exercise 9 (Optional): Work IQ — Surface M365 Context

> Requires Microsoft 365 with Copilot enabled.

1. Install the Work IQ plugin via `/plugin install`
2. Query your calendar, emails, and Teams messages from the terminal
3. Combine M365 context with codebase reasoning in a single session

### Exercise 10 (Optional): Deploy to Azure with /fleet + Azure MCP Server

> Requires an active Azure subscription.

1. Register the Azure MCP Server with `/mcp add`
2. Query your existing Azure resources
3. Use `/fleet` to deploy the backend to Azure App Service
4. Verify the deployment and clean up resources
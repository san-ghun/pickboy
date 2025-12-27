# Warehouse Simulation Game (Pokémon Style)

A 2D top-down simulation game with a Pokémon-style pixel art aesthetic to experience and learn warehouse logistics processes.

## 🚀 Key Features (MVP)
- **Top-down Movement**: Grid-based movement inspired by classic 2D RPGs.
- **Logistics Workflow**: Pick items from racks based on a picking list and ship them from the shipping zone.
- **Visual Feedback**: Pokémon-style follower inventory, dialogue boxes, and sparkle effects for targets.
- **Dynamic HUD**: Real-time status display and interactive picking list.

## 🛠️ Technology Stack
- **Framework**: Phaser 3 (JavaScript Game Engine)
- **Language**: TypeScript
- **Tooling**: Vite

## 🏗️ Project Structure
The project follows a modular architecture for better readability and maintainability:
- `/src/entities/`: Game entities like `Player.ts`.
- `/src/ui/`: Modular HUD components (`DialogueHUD`, `TaskHUD`, `StatusHUD`).
- `/src/managers/`: Logic handlers like `WarehouseManager` and `SlottingManager`.
- `/src/scenes/`: Phaser scenes; `GameScene.ts` acts as the main orchestrator.
- `/src/types.ts`: Centralized TypeScript definitions.

## ⚡ Quick Start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

## 📖 Documentation
Detailed project documentation can be found in the `/docs` directory:
- [PRD (Product Requirements)](./docs/PRD.md)
- [Feature Specification](./docs/FEATURE_SPEC.md)
- [Progress Report](./docs/PROGRESS.md)

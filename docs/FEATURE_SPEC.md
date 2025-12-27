# Feature Specification Document: Warehouse Simulation

## 1. Mechanics
- **Grid-based Movement**: 4-directional movement using Arrow Keys/WASD.
- **Interaction System**: Space bar triggers picking at racks or shipping at the shipping zone.
- **Follower Inventory**: Picked items follow the player sprite visually.

## 2. Map Elements
- **Racks**: Occupy specific tiles and have unique IDs (A-01-1, B-01-3, etc.).
- **Shipping Zone**: A 4x4 blue area in the top-right corner for final order shipment.
- **Sparkles**: Animated stars that highlight the next target for the player.

## 3. User Interface
- **Status HUD**: Displays current coordinates and specific zone names.
- **Pick List HUD**: Real-time checklist of items required for the current order.
- **Dialogue Boxes**: Pokémon-style popups for tutorials and feedback.

## 4. Workflows
- **Picking**: Approach a rack -> Press Space -> Item joins the follower chain.
- **Shipping**: Approach Shipping Zone -> Press Space -> Shipment verification and completion.

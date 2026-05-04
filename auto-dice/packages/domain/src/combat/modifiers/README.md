# Modifier application order

1. **Hit stage**: apply `hit_bonus` / reroll metadata (rerolls modeled as tags on dice in MVP).  
2. **Wound stage**: `wound_bonus`, `lethal_hits`, `devastating_wounds` flags influence tags.  
3. **Save / FNP**: `save_bonus` then FNP rolls.

Conflicting pairs (e.g. duplicate exclusive flags) are rejected in `modifier-engine.ts` before rolling.

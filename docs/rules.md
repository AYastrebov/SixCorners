# 6 Corners: game rules

This spec is the source of truth for `src/core`. It is based on the 2011 iOS
game (tag `v0-ios-legacy`, mainly `Classes/GameField.mm`, `Figure.m` and
`AbstractField.m`). Rules that differ from the original are listed under
[Changes from 2011](#changes-from-2011).

## Board

- 11 columns of flat-top hexagons. Odd columns (1, 3, …, 9) sit half a cell
  higher than even ones.
- Even columns have 20 rows; odd columns have 19, so the top edge is even.
  That makes 215 cells.
- Row 0 is the bottom.

### Coordinates

Cells use **doubled height** coordinates `(x, y)`: `x` is the column, `y`
counts half-rows from the bottom, and `x + y` is always even.

```
y
6  ⬡           ⬡         even column x, row r  →  (x, 2r)
5      ⬡   ⬡             odd  column x, row r  →  (x, 2r + 1)
4  ⬡           ⬡
3      ⬡   ⬡             neighbours of (x, y):
2  ⬡           ⬡           (x, y±2)  above / below
1      ⬡   ⬡               (x±1, y±1) the four diagonals
0  ⬡           ⬡
   0   1   2   3   x
```

Rotation converts to cube coordinates (`q = x`, `r = (y − x) / 2`), turns by
60°, and converts back. Everything stays an integer. This replaces the 2011
code's float pixel comparisons.

## Pieces

Ten pieces, each four hexes: the complete set of one-sided tetrahexes. Each
piece has a pivot, the point it rotates around. Offsets are `(x, y)` from the
pivot.

| Id  | Offsets                     | Note                       |
| --- | --------------------------- | -------------------------- |
| 1   | (0,2) (0,0) (0,−2) (0,−4)   | bar                        |
| 2   | (0,2) (0,0) (−1,−1) (1,−1)  | propeller                  |
| 3   | (0,2) (0,0) (0,−2) (1,−1)   | mirror of 4                |
| 4   | (0,2) (0,0) (0,−2) (−1,−1)  | mirror of 3                |
| 5   | (0,2) (0,0) (−1,−1) (−1,−3) | mirror of 6                |
| 6   | (0,2) (0,0) (1,−1) (1,−3)   | mirror of 5                |
| 7   | (0,4) (0,2) (0,0) (1,−1)    | mirror of 8                |
| 8   | (0,4) (0,2) (0,0) (−1,−1)   | mirror of 7                |
| 9   | (0,2) (−1,1) (1,1) (1,−1)   | arch; pivots on empty cell |
| 10  | (0,2) (0,0) (1,1) (1,−1)    | bee                        |

The next piece is drawn uniformly from all ten with a seeded RNG, and shown
as a preview.

## Spawning

A new piece appears in column 4 with its top cell on the top row (row 19). If
any of its cells overlap locked cells, the game is lost.

## Controls and movement

| Action       | Touch (2011)       | Effect                                 |
| ------------ | ------------------ | -------------------------------------- |
| Left / right | swipe left / right | move one column                        |
| Rotate       | tap the piece      | turn 60° counter-clockwise             |
| Soft drop    | swipe down         | fall every 50 ms until the piece locks |

- **Sideways moves** keep the pivot in the same row, so a piece steps half a
  cell up into an odd column and half a cell down out of one. If the upward
  step is blocked, the downward diagonal is tried instead. A move never goes up
  as a fallback, so pieces can't climb.
- **Rotation** turns around the pivot. If that pushes cells through a side
  wall, the piece is moved back inside by as many columns as needed, trying the
  lower diagonal first. If the piece would overlap locked cells or the floor,
  the rotation is refused.
- **Soft drop** ends when the piece locks or on any other input.
- Cells above the top of the board are allowed while a piece is falling.

## Gravity and locking

The piece falls one row per interval. When it can't fall, it locks. A piece
that locks with any cell above the board loses the game.

| Speed       | 1    | 2    | 3    | 4    | 5    | 6    | 7   | 8   | 9   | 10  |
| ----------- | ---- | ---- | ---- | ---- | ---- | ---- | --- | --- | --- | --- |
| Interval ms | 2250 | 2000 | 1750 | 1500 | 1250 | 1000 | 750 | 500 | 250 | 200 |

## Lines

A line is 11 cells, one per column. Clearing it removes those cells, and each
column's cells above drop by one row. After a lock, full lines are cleared
lowest first until none are left.

- **Rising** line `n`: row `n` in every column. Because odd columns sit
  higher, it zig-zags. Rows 0–18. The 2011 game cleared only these.
- **Falling** line `n`: even columns at row `n`, odd columns at row `n − 1`.
  Rows 1–19. The 2011 code built these lines but never checked them. They are
  off by default: `Rules.lineShapes`.

## Modes and scoring

- **Levels 1–10**: speed equals the level. Win by clearing `9 + level` lines.
- **Endless**: choose a speed 1–10. Play until the board fills up.
- **Score**: +1 for each row a piece falls during soft drop. Line clears don't
  score, as in 2011. Lines are counted separately.

## Changes from 2011

| 2011 behaviour                                                        | Now                                  |
| --------------------------------------------------------------------- | ------------------------------------ |
| Locked as soon as a cell reached row 0                                | Locks when it can't fall any further |
| A global up/down toggle made left-then-right climb half a row         | Moves keep the pivot's row           |
| A piece locking above the board didn't end the game                   | It does                              |
| Missing `break`s gave levels 6, 10 and endless the wrong achievements | No achievements yet                  |

## Open questions

- Should line clears score, and should multiple lines score more?
- Should falling lines be on?
- Add a hard drop, hold piece or ghost piece?

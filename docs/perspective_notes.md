# Perspective Implementation Notes

## Camera Configuration
- Position: (1.37m, 0.76m, 1m) - half table length, table height, 1m from edge
- Looking angle: horizontal with 5° downward tilt
- Field of view: 60 degrees

## Coordinate System
- Origin: Front-left corner of table
- X-axis: Along table length (2.74m)
- Y-axis: Vertical (0.76m table height)
- Z-axis: Along table width (1.525m)

## Transformations
Using perspective projection matrix with following parameters:
- Near plane: 0.1m
- Far plane: 10m
- Aspect ratio: Matches canvas dimensions
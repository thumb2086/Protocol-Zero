export const phantomBlueprint = {
    "name": "Phantom",
    "parts": [
        {
            "name": "Silencer",
            "type": "extrusion",
            "profile": "ChamferedRectangle",
            "profileParams": [
                0.8,
                1.2,
                0.3
            ],
            "length": 3.0,
            "position": {
                "x": 0,
                "y": 0,
                "z": 4.5
            },
            "color": "#2c3e50"
        },
        {
            "name": "Handguard",
            "type": "loft",
            "profile": "ChamferedRectangle",
            "profileParams": [
                0.9,
                1.3,
                0.2
            ],
            "profileB": "Trapezoid",
            "profileBParams": [
                0.8,
                1.2,
                1.5
            ],
            "length": 3.0,
            "position": {
                "x": 0,
                "y": 0,
                "z": 1.5
            },
            "color": "#34495e"
        },
        {
            "name": "Receiver",
            "type": "extrusion",
            "profile": "Trapezoid",
            "profileParams": [
                0.8,
                1.2,
                1.5
            ],
            "length": 3.0,
            "position": {
                "x": 0,
                "y": 0,
                "z": -1.5
            },
            "color": "#2c3e50"
        },
        {
            "name": "TopRailCover",
            "type": "extrusion",
            "profile": "ChamferedRectangle",
            "profileParams": [
                0.9,
                0.4,
                0.1
            ],
            "length": 6.0,
            "position": {
                "x": 0,
                "y": 0.8,
                "z": 1.5
            },
            "color": "#1a1a1a",
            "parent": "Receiver"
        },
        {
            "name": "Magazine",
            "type": "extrusion",
            "profile": "Rectangle",
            "profileParams": [
                0.6,
                1.2
            ],
            "length": 2.0,
            "position": {
                "x": 0,
                "y": -1.5,
                "z": -0.5
            },
            "rotation": {
                "x": 0.2,
                "y": 0,
                "z": 0
            },
            "color": "#2c3e50",
            "parent": "Receiver"
        },
        {
            "name": "Stock",
            "type": "extrusion",
            "profile": "Rectangle",
            "profileParams": [
                1.0,
                2.0
            ],
            "length": 2.5,
            "position": {
                "x": 0,
                "y": -0.2,
                "z": -4.0
            },
            "color": "#34495e",
            "parent": "Receiver"
        }
    ]
};

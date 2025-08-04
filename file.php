<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dynamic Invoice Generator</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.js"></script>
    <style>
        :root {
            --backg: url("bg.jpg"); /* Background */
        }

        body {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
            font-family: Century Gothic, sans-serif;
        }

        .controls {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 200px; /* Width of the controller area */
        }

        .direction {
            width: 50px;
            height: 50px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 24px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 5px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .direction:hover {
            background-color: #0056b3;
        }

        .horizontal-controls {
            display: flex;
            justify-content: center;
            width: 100%;
        }

        .canva {
            height: 560px;
            background: var(--backg) no-repeat;
            background-size: cover;
            position: relative;
            width: 600px; /* Width of the invoice area */
        }

        @media (max-width: 768px) {
            body {
                flex-direction: column;
                height: auto;
                padding: 10px;
            }
            
            .controls {
                width: 100%;
                margin-bottom: 20px;
            }
            
            .canva {
                width: 100%;
                max-width: 400px;
                height: auto;
                aspect-ratio: 600/560;
                margin: 0 auto;
            }
            
            .background-options {
                width: 100%;
                margin-top: 20px;
            }
        }

        #movableDiv {
            position: absolute;
            transition: top 0.2s, left 0.2s;
        }

        input {
            margin: 5px;
            padding: 5px;
            border: 1px solid white;
            border-radius: 5px;
            font-size: 14px;
            outline: none;
        }

        button {
            display: block;
            margin-top: 10px;
            padding: 10px;
            background-color: #007bff;
            color: white;
            border: none;
            cursor: pointer;
            border-radius: 5px;
        }

        button:hover {
            background-color: #0056b3;
        }

        .background-options {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="controls">
        <button class="direction" onclick="move('up')">↑</button>
        <div class="horizontal-controls">
            <button class="direction" onclick="move('left')">←</button>
            <button class="direction" onclick="move('right')">→</button>
        </div>
        <button class="direction" onclick="move('down')">↓</button>
    </div>

    <div id="canva" class="canva">
        <div id="movableDiv">
            <div class="stmp">
                <input placeholder="Insert Time" type="text" class="bt">
                <input placeholder="Insert Date" type="text" class="vd"><br>
            </div>
            <div>
                <input placeholder="Insert Time" type="text" class="et"><br>
                <input placeholder="Insert Bus" type="text" class="bn">
            </div>
        </div>
    </div>

    <div class="background-options">
        <input type="radio" id="bg-1" value="url('bg.jpg')" name="backg">
        <label for="bg-1">Background 1</label>
        <input type="radio" id="bg-2" value="url('dw.jpg')" name="backg">
        <label for="bg-2">Background 2</label>
        <button onclick="shot()">Generate</button>
    </div>

    <script>
        function shot() {
            var node = document.getElementById('canva');
            
            // Get the actual rendered dimensions
            const rect = node.getBoundingClientRect();
            
            var options = {
                width: rect.width,
                height: rect.height,
                style: {
                    margin: '0',
                    padding: '0'
                }
            };
            
            domtoimage.toPng(node, options).then(function(dataUrl) {
                var img = new Image();
                img.src = dataUrl;
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                document.body.appendChild(img);
            }).catch(function(error) {
                console.error('Oops, something went wrong!', error);
            });
        }

        document.getElementById('bg-1').addEventListener('change', (e) => {
            document.documentElement.style.setProperty('--backg', e.target.value);
        });

        document.getElementById('bg-2').addEventListener('change', (e) => {
            document.documentElement.style.setProperty('--backg', e.target.value);
        });

        function move(direction) {
            const div = document.getElementById('movableDiv');
            const style = window.getComputedStyle(div);
            let top = parseInt(style.top, 10);
            let left = parseInt(style.left, 10);

            switch (direction) {
                case 'up':
                    top -= 10;
                    break;
                case 'down':
                    top += 10;
                    break;
                case 'left':
                    left -= 10;
                    break;
                case 'right':
                    left += 10;
                    break;
            }

            div.style.top = `${top}px`;
            div.style.left = `${left}px`;
        }
    </script>
</body>
</html>

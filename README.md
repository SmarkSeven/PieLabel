# PieLabel
A Pie with D3.js v4
![](http://ocm1e5iqa.bkt.clouddn.com/pielabel.gif)

**use case:**
```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <script src="http://d3js.org/d3.v4.min.js"></script>
  <script src="./PieLabel.js"></script>
  <title>D3_DEMO</title>
  <style>
  body {
      display: flex;
      height: 100vh;
      justify-content: center;
      align-items: center;
    }
  </style>
</head>
<body>
  <svg id="fillgauge" width="800" height="500"></svg>
  <script language="JavaScript">
    const data1 = [{label: 'Go', value: 10}, {label: 'Rust', value: 20}, {label: 'R', value: 30}]
    const data2 = [{label: 'Go', value: 30}, {label: 'Rust', value: 30}, {label: 'R', value: 30}]
    const pie = new Pie("fillgauge", data1)
    pie.render()
    document.body.onclick = () => {
      pie.update(data2)
    }
  </script>
</body>
</html>

```

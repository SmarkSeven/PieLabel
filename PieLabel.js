class DefaultSettings {
  constructor() {
    this.outerRadius = 0.8  // 半径的百分比
    this.innerRadius = 0.5  // 半径的百分比
    this.outernArcRadius = 0.9  // 内圆弧半径
    this.innernArcRadius = 0.75  // 外圆弧半径
    this.animateTime = 1000 // 动画时间
  }
}

function key(d) {
  return d.data.label;
}

function midAngle(d) {
  return d.startAngle + (d.endAngle - d.startAngle) / 2;
}

class Pie {
  constructor(elementId, data, config) {
    this.elementId = elementId
    this.data = data
    this.config = (config === undefined) ? new DefaultSettings() : config
    this.render = this.render.bind(this)
  }

  render() {
    const config = this.config
    const positions = []
    const element = d3.select(`#${this.elementId}`)
    const width = parseInt(element.style('width'))
    const height = parseInt(element.style('height'))
    const radius = Math.min(width, height) / 2;
    let piedata = d3.pie()
      .sort(null)
      .value((d) => {
        return d.value;
      })(this.data)
    const arc = d3.arc()
      .outerRadius(radius * config.outerRadius)
      .innerRadius(radius * config.innerRadius);

    const innerArc = d3.arc()
      .innerRadius(radius * config.innernArcRadius)
      .outerRadius(radius * config.innernArcRadius);

    const outerArc = d3.arc()
      .innerRadius(radius * config.outernArcRadius)
      .outerRadius(radius * config.outernArcRadius);

    const color = d3.scaleOrdinal(d3.schemeCategory20);

    const svg = element.append('g')
    const sliceGroup = svg.append('g')
      .attr('class', 'slices');
    const labelGroup = svg.append('g')
      .attr('class', 'labels');
    const lineGroup = svg.append('g')
      .attr('class', 'lines');

    svg.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    /* ------------- ARC ------------ */
    const slice = sliceGroup.selectAll('path')
      .data(piedata, key)
      .enter()
      .append('path')
      .style('fill', (d) => color(d.data.label))

    function dTween(d) {
      this._current = this._current || d;
      const interpolate = d3.interpolate(this._current, d);
      this._current = interpolate(0);
      return (t) => {
        return arc(interpolate(t))
      }
    }
    slice.transition()
      .duration(config.animateTime)
      .attrTween('d', dTween)

    slice.exit()
      .remove();

    /* ------------- TEXT ------------ */

    const text = labelGroup.selectAll('text')
      .data(piedata, key)
      .enter()
      .append('text')
      .attr('dy', '.35em')
      .text((d) => {
        return d.data.label
      })

    function labelTween(d, i) {
      this._current = this._current || d;
      const interpolate = d3.interpolate(this._current, d);
      this._current = interpolate(0);
      let yOffset = 0;
      const pos = outerArc.centroid(d);
      positions[i] = { pos };
      if (i !== 0) {
        const pre = positions[i - 1].pos;
        if (pre[0] === pos[0]) {
          const distance = pos[1] - pre[1];

          if (-25 < distance && distance < 25) {
            yOffset = pos[0] > 0 ? 25 - distance : -(25 + distance)
            if (pre.yOffset) {
              yOffset = distance > 0 ? yOffset + pre.yOffset : yOffset - pre.yOffset;
            }
          } else {
            if (pre[0] > 0 && distance < 0) {
              yOffset = -distance + 25
            } else if (pre[0] < 0 && distance > 0) {
              yOffset = -distance - 25
            }
          }
          pos[1] += yOffset;
          positions[i].pos = pos;
          positions[i].yOffset = yOffset;
        }
      }
      return (t) => {
        const d3 = interpolate(t);
        const pos = outerArc.centroid(d3);
        pos[0] = radius * (midAngle(d3) < Math.PI ? 1 : -1);
        pos[1] += yOffset;
        return 'translate(' + pos + ')';
      }
    }

    function textAnchorTween(d) {
        this._current = this._current || d
        const interpolate = d3.interpolate(this._current, d)
        this._current = interpolate(0)
        return (t) => {
          const d2 = interpolate(t);
          return midAngle(d2) < Math.PI ? 'start' : 'end'
        }
      }

    text.transition()
      .duration(config.animateTime)
      .attrTween('transform', labelTween)
      .styleTween('text-anchor', textAnchorTween)

    text.exit()
      .remove()

    /* ------- OLYLINES -------*/
    const polyline = lineGroup.selectAll("polyline")
      .data(piedata, key)
      .enter()
      .append("polyline")
      .style('stroke-width', 2)
      .style('stroke', '#555')
      .style('fill', 'none')


    function pointsTween(d, i) {
      this._current = this._current || d
      const interpolate = d3.interpolate(this._current, d)
      this._current = interpolate(0)
      const yOffset = positions[i].yOffset;
      return (t) => {
        const d2 = interpolate(t)
        const pos = outerArc.centroid(d2);
        pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1)

        const pos2 = outerArc.centroid(d2)
        if (yOffset) {
          pos[1] += yOffset
          pos2[1] += yOffset
        }
        return [innerArc.centroid(d2), pos2, pos]
      }
    }

    polyline.transition().duration(config.animateTime)
      .attrTween("points", pointsTween)

    polyline.exit()
      .remove()

    this.update = function update(data) {
      this.data = data
      piedata = d3.pie()
        .sort(null)
        .value((d) => {
          return d.value;
        })(this.data)
      

      slice.data(piedata, key)
      .transition()
      .duration(config.animateTime)
      .attrTween("d", dTween)

      text.data(piedata, key)
      .transition()
      .duration(config.animateTime)
      .attrTween("transform", labelTween)
      .styleTween('text-anchor', textAnchorTween)

      polyline.data(piedata, key)
      .transition()
      .duration(config.animateTime)
      .attrTween("points", pointsTween)
    }

    
  }
}

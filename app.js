Promise.all([d3.json("bubble_map2.json")])
  .then(ready)
  .catch((err) => {
    console.log(err);
  });

function ready(res) {
  let raw = res[0];
  let width = 1050;
  let height = 500;

  let bubbles = topojson.feature(raw, raw.objects.bubbles);
  let states = topojson.feature(raw, raw.objects.state);

  let svg = d3.select("body").select("svg");

  let myProjection = d3.geoAlbersUsa().fitSize([width, height], states);
  let bubbleProjection = d3.geoAlbersUsa().fitSize([width, height], bubbles);

  let path = d3.geoPath().projection(myProjection);
  let pathBubbles = d3.geoPath().projection(bubbleProjection);

  let innerlines = topojson.mesh(raw, raw.objects.state, (a, b) => a != b);

  svg
    .append("g")
    .selectAll(".states")
    .data(states.features)
    .join("path")
    .attr("d", path)
    .style("fill", "#ededed")
    .style("stroke", "#333")
    .style("stroke-width", "0.5")
    .style("pointer-events", "none");

  let points = svg
    .append("g")
    .selectAll(".bubbles")
    .data(bubbles.features.filter((d) => d.geometry))
    .join("circle")
    .attr("cx", (d) => path.centroid(d)[0])
    .attr("cy", (d) => path.centroid(d)[1])
    .attr("id", (d) => `county-${d.properties.GEOID}`)
    .style("fill", "orange")
    .style("stroke", "white")
    .style("stroke-width", "0.25")
    .style("r", (d) => d.properties.resized);

  let popup = d3.select(".pop-up");
  points.on("mouseover", (event, d) => {
    let text = `<strong>${
      d.properties.NAMELSAD
    }</strong> had <strong>${d3.format(",")(
      d.properties.pop_18_in_poverty
    )}</strong> people living in poverty in 2018`;

    popup
      .style("opacity", 1)
      .style("left", event.x - 75 + "px")
      .style("top", event.y - 125 + "px")
      .html(text);

    points
      .style("fill", "orange")
      .style("stroke", "white")
      .style("stroke-width", "0.25");

    svg
      .select(`#county-${d.properties.GEOID}`)
      .style("stroke-width", "0.5")
      .style("fill", "purple")
      .raise();
  });

  points.on("mouseout", (event, d) => {
    points
      .style("fill", "orange")
      .style("stroke", "white")
      .style("stroke-width", "0.25")
      .sort(
        (a, b) =>
          a.properties.pop_18_in_poverty < b.properties.pop_18_in_poverty
      );

    popup.style("opacity", 0);
  });
}

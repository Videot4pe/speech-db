import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

import AudioWaveform from "../../lib/waveform/audio-waveform";

const Waveform = ({ url }: { url: string | undefined }) => {
  const waveformRef = useRef<HTMLDivElement | undefined>();
  const [waveform, setWaveform] = useState<AudioWaveform | undefined>();
  const [data, setData] = useState<number[]>([]);

  const width = 400;
  const height = 300;

  useEffect(() => {
    if (url) {
      const newWaveform = new AudioWaveform(url);
      setWaveform(newWaveform);
      newWaveform.fetchFile().then((payload) => {
        setData(payload);
      });
    }
  }, [url]);

  useEffect(() => {
    // Create our scales to map our data values(domain) to coordinate values(range)
    const xScale = d3.scaleLinear().domain([0, 15]).range([0, 300]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([300, 0]); // Since the SVG y starts at the top, we are inverting the 0 and 300.

    // Generate a path with D3 based on the scaled data values
    const line = d3
      .line()
      .x((dt) => xScale(dt))
      .y((dt) => yScale(dt));

    // Generate the x and y Axis based on these scales
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Create the horizontal base line
    d3.select("#LineChart")
      .selectAll("path")
      .datum(data) // Bind our data to the path element
      .attr(
        "d",
        d3.line().x((dt) => xScale(dt)) // Set the path to our line function, but where x is the corresponding x.y(yScale(0))
      )
      .attr("stroke", "blue")
      .attr("fill", "none"); // Set the y to always be 0 and set stroke and fill color

    d3.select("#LineChart")
      .selectAll("path")
      .transition()
      .duration(1000) // Transition the line over 1 sec
      .attr("d", line); // Set the path to our line variable (Which corresponds the actual path of the data)

    // Append the Axis to our LineChart svg
    d3.select("#LineChart")
      .append("g")
      .attr("transform", `translate(0, ${300})`)
      .call(xAxis);

    d3.select("#LineChart")
      .append("g")
      .attr("transform", "translate(0, 0)")
      .call(yAxis);
  }, [data]);

  return (
    <div>
      <svg id="LineChart" width={350} height={350}>
        <path />
      </svg>
      {data.join(", ")}
    </div>
  );
};

export default Waveform;

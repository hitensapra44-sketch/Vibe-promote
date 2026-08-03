import React, { useRef, useEffect } from "react";

const Noise: React.FC<{ patternRefreshInterval?: number; patternAlpha?: number }> = ({ patternRefreshInterval = 2, patternAlpha = 14 }) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const c=ref.current;if(!c)return;const ctx=c.getContext("2d",{alpha:true});if(!ctx)return;
    let f=0,id=0,S=1024;const resize=()=>{c.width=S;c.height=S;c.style.width="100vw";c.style.height="100vh";};
    const draw=()=>{const img=ctx.createImageData(S,S);const d=img.data;for(let i=0;i<d.length;i+=4){const v=Math.random()*255;d[i]=v;d[i+1]=v;d[i+2]=v;d[i+3]=patternAlpha;}ctx.putImageData(img,0,0);};
    const loop=()=>{if(f%patternRefreshInterval===0)draw();f++;id=requestAnimationFrame(loop);};
    addEventListener("resize",resize);resize();loop();return()=>{removeEventListener("resize",resize);cancelAnimationFrame(id);};
  },[patternRefreshInterval,patternAlpha]);
  return <canvas ref={ref} className="pointer-events-none absolute inset-0" style={{ imageRendering: "pixelated" }}/>;
};

export default function GridBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_560px_at_50%_220px,#ef444433,transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415566_1px,transparent_1px),linear-gradient(to_bottom,#33415566_1px,transparent_1px)] bg-[size:14px_20px]" />
      <Noise patternAlpha={18}/>
    </div>
  );
}

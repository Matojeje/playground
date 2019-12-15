/**
 * Bresenham Curve Rasterizing Algorithms
 * @author  Zingl Alois
 * @date    17.12.2014
 * @version 1.3
 * @url     http://members.chello.at/easyfilter/bresenham.html
*/

function assert(a) {
   if (!a) console.log("Assertion failed in bresenham.js "+a);
   return a;
}
   
function plotLine(x0, y0, x1, y1)
{
   var dx =  Math.abs(x1-x0), sx = x0<x1 ? 1 : -1;
   var dy = -Math.abs(y1-y0), sy = y0<y1 ? 1 : -1;
   var err = dx+dy, e2;                                   /* error value e_xy */

   for (;;){                                                          /* loop */
      setPixel(x0,y0);
      if (x0 == x1 && y0 == y1) break;
      e2 = 2*err;
      if (e2 >= dy) { err += dy; x0 += sx; }                        /* x step */
      if (e2 <= dx) { err += dx; y0 += sy; }                        /* y step */
   }
}

function plotCircle(xm, ym, r)
{
   var x = -r, y = 0, err = 2-2*r;                /* bottom left to top right */
   do {
      setPixel(xm-x, ym+y);                            /*   I. Quadrant +x +y */
      setPixel(xm-y, ym-x);                            /*  II. Quadrant -x +y */
      setPixel(xm+x, ym-y);                            /* III. Quadrant -x -y */
      setPixel(xm+y, ym+x);                            /*  IV. Quadrant +x -y */
      r = err;                                       
      if (r <= y) err += ++y*2+1;                                   /* y step */
      if (r > x || err > y) err += ++x*2+1;                         /* x step */
   } while (x < 0);
}
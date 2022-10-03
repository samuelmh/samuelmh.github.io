/*
 * AUTHOR: Samuel Muñoz Hidalgo <samuel.mh@gmail.com>
 * DATE: 31-MAR-2013
 * DESCRIPTION:
 *  Statistical PI computation by simulating random throws to a dartboard.
 *  Based on the Revealing Module Pattern.
*/


var Dartboard = function() {
    
    var width = 600,
        height = 600,
        radius = 217; //Radius of the centered dartboard.
        
    var canvas, context;    
    var image;    
    var pixel_hit, pixel_fail;    
    var stat_thrown, stat_hit;    
    var continuous_launching;
    
    var update_stats_callback;
    
    var preconstant_pi; //Accelerate some operations
    
    /*
    * Create the widget
    *
    * canvas_id: the canvas id
    * update_callback: function(throws,hit,pi) to call when recalculating these values.
    */    
    function init(canvas_id, update_callback, background_img){
        canvas = document.getElementById(canvas_id);
        canvas.height = height;
        canvas.width = width;
        context = canvas.getContext("2d");
        
        update_stats_callback = update_callback;
        
        image = new Image();
        image.src = background_img;
        image.onload = function(){reset();};      
        
        preconstant_pi = (width*height)/Math.pow(radius,2);
        
                
        //Drawn pixels (fastest method?)
        pixel_hit = context.createImageData(1,1);
        var d  = pixel_hit.data;                        // only do this once per page
        d[0]   = 255;
        d[1]   = 0;
        d[2]   = 0;
        d[3]   = 255;
        pixel_fail = context.createImageData(1,1);
        var c  = pixel_fail.data;                        // only do this once per page
        c[0]   = 0;
        c[1]   = 0;
        c[2]   = 255;
        c[3]   = 255;        
    }
    
    
    //Did a thrown fall into the dartboard?
    function in_dartboard(x,y){
        return( Math.sqrt(Math.pow(x-(width/2),2)+Math.pow(y-(height/2),2)) <= radius);        
    }
    
    function update_stats(){
        update_stats_callback(stat_thrown, stat_hit, (stat_hit/stat_thrown)*preconstant_pi);
    }
    
    //Random thrown
    function throw_n(n){
        var x,y,pixel;
        while(n>=1){
            x = Math.floor((Math.random()*width)+1);
            y =  Math.floor((Math.random()*height)+1);
            stat_thrown++;
            if (in_dartboard(x,y)){
                pixel = pixel_hit;
                stat_hit++;            
            } else {
                pixel = pixel_fail;;
            }
            context.putImageData( pixel, x, y );
            n--;
        }
        update_stats();
    }
        
    //Cotinuous dart throwing    
    function throw_start_stop(n, millis){
        function throw_callback(n, millis){
            if(continuous_launching){
                throw_n(n);
                setTimeout(function(){throw_callback(n,millis)}, millis);
            }
        };    
        continuous_launching = !continuous_launching;
        throw_callback(n, millis);
    }
        
    
    function reset(){
        continuous_launching = false;
        context.drawImage(image, 0, 0,width,height);        
        stat_hit = 0;
        stat_thrown = 0;        
        update_stats();
    }
    
    return {
        init: init,
        throw_n: throw_n,
        throw_start_stop: throw_start_stop,
        reset: reset
    };

}
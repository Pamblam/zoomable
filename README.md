# Zoomable

A Javascript configurable thingy that makes your images zoomable.

Just pass a **fixed or absolutely positioned** image to the `zoomable` function:

    <img src='https://i.imgur.com/nf6oSGR.jpg' style='width:30em; position:fixed; opacity: 0.5;' id='waldo'>
    <script src='zoomable.js'></script>
    <script>
        var img = document.getElementById('waldo');
        zoomable(img);
    </script>

Currently this only works if the image is **fixed or absolutely positioned**.

![Waldo Demo](https://i.imgur.com/kTmlFfl.png)
	
There are several options available, which you can pass to the function: `zoomable(img, options)`.

 - **options.trigger**: How do you want the magnifying glass to be triggered? Can be either `mousedown` or `mouseover`. Default is `mousedown`.
 - **options.zoomlevel**: How much should the magnifying glass magnify? Must be a positive number. Numbers less than 1 will actually make the image smaller. Default is `2.5`.
 - **options.boxShadow**: How should the shadow look? Can be any valid value for a CSS `box-shadow` property. Default is `0 0 7px 7px rgba(0, 0, 0, 0.25), inset 0 0 40px 2px rgba(0, 0, 0, 0.25)`.
 - **options.magBorderRadius**: How round should the border be? Can be any valid value for a CSS `border-radius` property. May be buggy if set to `0` or `none`. Default is `100%` (full circle).
 - **options.magWidth**: How wide do you want the magnifying glass to be? Can be any CSS width value (px, em, etc). Default is `5em`.
 - **options.magHeight**: How Tall do you want the magnifying glass to be? Can be any CSS width value (px, em, etc). Default is `5em`.
 - **options.magBorder**: How should the magnifying glass border appear? Can be any valid value for a CSS `border` property. Default is `5px solid white`.
 - **options.background**: What should appear behind the image when viewing near edges? Default is `white` but you can set to `none` if you want the rest of your page to show thru un-magnified. This can also be set to any valid CSS `background` value.


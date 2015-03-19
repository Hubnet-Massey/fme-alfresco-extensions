# Gallery Plus Dashlet Developer Notes #

Share already has an image dashlet, why write another one?
The image summary dashlet in Share has several limitations…
  * It shows all images of the site without any filters or sorting
  * Thumbnails are tiny and it looks unexciting (4.0 only adds hover actions afaik)
  * The preview does not work with large images (bigger than screen)
  * You cannot view images that are not in the current site.

The Gallery Plus Dashlet uses its own thumbnail definitions which can require quite some space and additional objects in the repository (120 pixel, 200 pixel thumbnails and 800x600 preview images). The large 800x600 preview images are only generated on demand when the first user accesses them.

The G+ style thumbnail view requires a fixed height (120px or 200px) for the thumbnails. The width of the thumbnails must also be known to align them correctly. This is why “extract metadata” is used to determine the thumbnail dimensions in the repository.

While I was developing the gallery dashlet Google introduced their “infinite scroll” feature and I decided to incorporate it as well to deal with the paging of the thumbnails.

The genius of the alignment of the thumbnail images is, that images of ANY dimension can be fit in ANY window size, you still get perfectly aligned images and use all the space that is available. There is no denying that the idea comes from Google but I sat down, analyzed the behavior of G+ and created the algorithm for the alignment in javascript from scratch. It suits a dashlet very well because it needs to be displayed in a variety of sizes.

The original G+ gallery does some other neat tricks which I couldn’t implement here: For one the image height is altered slightly to better deal with different image dimensions (Google has at least 10-20 different renditions of the images). They also use different sizes depending on the width of the browser window. Finally they have a big image spanning multiple rows for album cover images.

For the preview window I have reused/rewritten the SimpleDialog. I actually started by designing a simple HTML page with a YUI PopupDialog, did all the basic CSS and layout there and then built it into the Share dialog.

The repository action doesn’t only generate thumbnails but it also runs the “extract Metadata” action on the generated thumbnails to determine their dimensions.

I’m not thrilled that the dashlet needs repository extension (model, action) but it absolutely requires the thumbnail dimensions being available and the Album aspects makes for a convenient way to select albums.
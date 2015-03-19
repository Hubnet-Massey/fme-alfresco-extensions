# Gallery Plus Dashlet Configuration #

![http://fme-alfresco-extensions.googlecode.com/svn/trunk/Gallery%20Plus%20Dashlet/documentation/gallery-plus-screenshot-04.jpg](http://fme-alfresco-extensions.googlecode.com/svn/trunk/Gallery%20Plus%20Dashlet/documentation/gallery-plus-screenshot-04.jpg)

| **Option** | **Description** |
|:-----------|:----------------|
| Dashlet Title | A custom title for the dashlet, use any name you want. |
| View mode | You can either select **Albums** to show album stacks or **Images** to display thumbnail images. |
| Thumnail size | Choose between normal (120 pixel) or big (200 pixel) thumbnails. This only affects the _Images View_ |
| Show one specific album | Choose an album from the repository that you want to display. This is only used in the _Images View_ |
| Filter by foler path | Select a folder path to filter by. Only images or albums below this path are displayed. This uses a Lucene PATH:// query internally so it can be slow on large repositories |
| Filter by tags | Allows you to filter your images or albums by a tag. Only on tag is allowed here |
| Sort by | You can sort images by a custom property. The property has to be spcified in a lucene compatible format, e.g. cm:name or cm:modified. Sorting is only supported for the  _Images View_ |
| Sort order | Choose if you want images to be sorted ascending or descending. Sorting is only supported for the  _Images View_ |
| initial Images (# per load) | The number of images that are initially loaded when the dashlet is displayed. Also this is the number of images that are loaded when the dashlet is scrolled (paged). This only affects the _Images View_ |
| max # of images | The maximum number of images displayed in the dashlet. This only affects the _Images View_  |
| background color | A HTML color code to specifiy the background color of the dashlet. |
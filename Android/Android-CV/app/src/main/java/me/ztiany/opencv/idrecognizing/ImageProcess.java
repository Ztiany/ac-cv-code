package me.ztiany.opencv.idrecognizing;

import android.graphics.Bitmap;

public class ImageProcess {

    static {
        System.loadLibrary("native-lib");
    }

    public static native Bitmap getIdNumber(Bitmap src, Bitmap.Config config);

}
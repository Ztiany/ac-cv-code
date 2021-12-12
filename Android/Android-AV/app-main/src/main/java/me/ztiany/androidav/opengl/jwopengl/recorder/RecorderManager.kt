package me.ztiany.androidav.opengl.jwopengl.recorder

import android.graphics.SurfaceTexture
import android.opengl.EGLContext
import android.opengl.GLSurfaceView
import android.util.Size
import androidx.appcompat.app.AppCompatActivity
import me.ztiany.androidav.opengl.jwopengl.common.EGLBridger
import me.ztiany.androidav.opengl.jwopengl.common.setGLRenderer
import me.ztiany.androidav.opengl.jwopengl.gles2.TextureAttribute
import timber.log.Timber
import java.util.concurrent.atomic.AtomicBoolean

class RecorderManager(
    private val context: AppCompatActivity
) {

    private lateinit var showRenderer: RecorderShowRenderer
    private lateinit var encodeRenderer: RecorderEncodeRenderer

    @Volatile var isRecording = false
        private set

    @Volatile private var isOperating = false

    private val hasInitialized = AtomicBoolean(false)

    var speed = Speed.MODE_NORMAL

    fun init(glSurfaceView: GLSurfaceView) {
        if (!hasInitialized.compareAndSet(false, true)) {
            throw IllegalStateException("Already init.")
        }
        //decode
        encodeRenderer = RecorderEncodeRenderer()
        //init the renderer
        showRenderer = RecorderShowRenderer(glSurfaceView.context, object : EGLBridger {
            override fun requestRender() {
                glSurfaceView.requestRender()
            }
        })

        glSurfaceView.run {
            setEGLContextClientVersion(2)
            setGLRenderer(showRenderer)
            renderMode = GLSurfaceView.RENDERMODE_WHEN_DIRTY
        }
    }

    fun onCameraAvailable(previewSize: Size, displayOrientation: Int, isFront: Boolean, startPreview: (SurfaceTexture) -> Unit) {
        Timber.d("onCameraAvailable() called with: previewSize = $previewSize, displayOrientation = $displayOrientation, isFront = $isFront")
        //provide the renderers texture the video size.
        val textureAttribute = TextureAttribute(previewSize.width, previewSize.height, displayOrientation, isFront, false)
        showRenderer.setVideoAttribute(textureAttribute)
        encodeRenderer.setVideoAttribute(textureAttribute)
        //start preview.
        showRenderer.getSurfaceTexture {
            startPreview(it)
        }
    }

    fun startRecording(path: String) {
        Timber.d("startRecording() called isRecording = $isRecording, isOperating = $isOperating")

        if (isRecording || isOperating) {
            return
        }
        isRecording = true
        isOperating = true

        showRenderer.startRecording(object : Recorder {
            override fun onStart(sharedEglContext: EGLContext) {
                encodeRenderer.start(sharedEglContext, newEncoder(path))
                isOperating = false
            }

            override fun onFrame(frame: TextureWithTime) {
                encodeRenderer.onFrame(frame)
            }

            override fun onStop() {
                encodeRenderer.stop()
                isOperating = false
            }
        })
    }

    fun stopRecording() {
        Timber.d("stopRecording() called isRecording = $isRecording, isOperating = $isOperating")
        if (!isRecording || isOperating) {
            return
        }
        isRecording = false
        isOperating = true
        showRenderer.stopRecording()
    }

    private fun newEncoder(path: String): Encoder {
        return HardEncoder(path, speed.getSpeedValue())
    }

}
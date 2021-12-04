package me.ztiany.androidav.opengl.jwopengl.renderer

import android.opengl.GLES20
import android.opengl.GLSurfaceView
import me.ztiany.androidav.R
import me.ztiany.androidav.common.loadBitmap
import me.ztiany.androidav.opengl.jwopengl.common.*
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10

class TextureRenderer : GLSurfaceView.Renderer {

    private lateinit var program: GLProgram
    private lateinit var glTexture: GLTexture

    /**矩形的坐标*/
    private val vertexVbo = generateVBOBuffer(
        newVertexCoordinateFull3().map {
            it * 0.8F
        }.toFloatArray()
    )

    /**纹理坐标*/
    private val textureCoordinateBuffer = generateVBOBuffer(newTextureCoordinate())

    override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
        program = GLProgram.fromAssets("shader/vertex_base.glsl", "shader/fragment_texture.glsl")
        program.activeAttribute("aPosition")
        program.activeAttribute("aTextureCoordinate")
        program.activeUniform("uTexture")

        glTexture = generateTextureFromBitmap(
            program.uniformHandle("uTexture"),
            0,
            loadBitmap(R.drawable.beautiful_gril1)
        )
    }

    override fun onSurfaceChanged(gl: GL10?, width: Int, height: Int) {
        GLES20.glViewport(0, 0, width, height)
    }

    override fun onDrawFrame(gl: GL10?) {
        program.startDraw {
            clearColorBuffer()
            glTexture.activeTexture()
            vertexAttribPointerFloat("aPosition", 3, vertexVbo)
            vertexAttribPointerFloat("aTextureCoordinate", 2, textureCoordinateBuffer)
            GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4/*4 个点*/)
        }
    }
}
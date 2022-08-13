package me.ztiany.androidav.player.mediacodec

import android.media.MediaCodec
import android.media.MediaCodecList
import android.media.MediaFormat
import timber.log.Timber
import java.nio.ByteBuffer

class AudioDataDecoder(
    stateHolder: CodecPlayerStateHolder,
    mediaFormat: MediaFormat,
    provider: MediaDataProvider,
    renderer: MediaDataRenderer
) : BaseDataDecoder(stateHolder, mediaFormat, provider, renderer) {

    override fun initDecoder(mediaFormat: MediaFormat, renderer: MediaDataRenderer): Boolean {
        return try {
            val name = MediaCodecList(MediaCodecList.ALL_CODECS).findDecoderForFormat(mediaFormat)
            Timber.d("initDecoder.findDecoderForFormat: $name")
            decoder = MediaCodec.createByCodecName(name)
            decoder.configure(mediaFormat, null, null, 0)
            Timber.d("initDecoder success")
            true
        } catch (e: Exception) {
            Timber.e(e, "initDecoder error")
            false
        }
    }

    override fun deliverFrame(renderer: MediaDataRenderer, data: ByteBuffer, outputBufferInfo: MediaCodec.BufferInfo, index: Int) {
        renderer.render(data, outputBufferInfo)
        decoder.releaseOutputBuffer(index, false)
    }

}
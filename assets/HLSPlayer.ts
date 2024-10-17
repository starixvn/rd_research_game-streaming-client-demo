import { _decorator, Component, Size, UITransform, VideoPlayer } from "cc";
import Hls from "hls.js";

const { ccclass, property } = _decorator;

@ccclass("HLSPlayer")
export class HLSPlayer extends Component {
  private videoPlayer: VideoPlayer = null;
  private hls: Hls = null;
  private _videoSource: string = "";
  private videoCurrentTime: number = 0;

  @property
  private playOnUpdateSource = true;

  currentTime: number = 0;

  get videoSource() {
    return this._videoSource;
  }

  set videoSource(value: string) {
    if (value && this.videoSource !== value) {
      this._videoSource = value;

      if (this.playOnUpdateSource) {
        this.play();
      }
    }
  }

  get bandwidthEstimate() {
    return this.hls?.bandwidthEstimate ?? 0;
  }

  play() {
    if (!this.isComponentValid) {
      return;
    }

    if (!this.initialized) {
      this.videoPlayer.node.active = true;
      this.hls = this.createHlsInstance();
    }

    this.hls.loadSource(this.videoSource);
    this.videoPlayer.nativeVideo.currentTime = this.currentTime;
    this.videoPlayer.nativeVideo.play();
  }

  updateSize(size: Size) {
    if (!this.isComponentValid) {
      return;
    }
    const ui = this.videoPlayer.getComponent(UITransform);
    const position = this.node.position.clone();

    ui.setContentSize(size);
    this.node.setPosition(position);
  }

  onFocusInEditor(): void {
    this.loadVideoPlayer();
  }

  protected lateUpdate(dt: number): void {
    this.currentTime += dt;

    if (Math.abs(this.currentTime - this.videoCurrentTime) > 1) {
      this.syncCurrentTime();
    }
  }

  protected onLoad(): void {
    this.loadVideoPlayer();
  }

  private syncCurrentTime() {
    if (this.isComponentValid && !!this.videoPlayer.nativeVideo) {
      this.videoPlayer.nativeVideo.currentTime = this.currentTime;
    }
  }

  private loadVideoPlayer() {
    this.videoPlayer = this.getComponentInChildren(VideoPlayer);

    if (this.videoPlayer) {
      this.videoPlayer.node.active = false;
    }
  }

  private createHlsInstance() {
    if (!Hls.isSupported()) {
      throw new Error("Hls.js is not supported.");
    }

    const hls = new Hls();

    hls.attachMedia(this.videoPlayer.nativeVideo);

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.log("[Hls.Error]: ", event, data);

      this.syncCurrentTime();
    });

    this.videoPlayer.nativeVideo.addEventListener("timeupdate", () => {
      this.videoCurrentTime = this.videoPlayer.nativeVideo.currentTime;
    });

    return hls;
  }

  private get isComponentValid() {
    return !!this.videoPlayer;
  }

  private get initialized() {
    return !!this.hls;
  }
}

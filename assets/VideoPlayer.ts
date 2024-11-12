import { _decorator, Component, Size, UITransform } from "cc";
import Hls from "hls.js";

const { ccclass } = _decorator;

@ccclass("VideoPlayer")
export class VideoPlayer extends Component {
  private hls: Hls = null;
  private native: HTMLVideoElement = null;

  private _videoSource: string = "";

  private get initialized() {
    return !!this.hls && !!this.native;
  }

  videoCurrentTime = 0;
  currentTime = 0;

  get videoSource() {
    return this._videoSource;
  }

  set videoSource(value: string) {
    if (value && this.videoSource !== value) {
      this._videoSource = value;

      this.play();
    }
  }

  get bandwidthEstimate() {
    return this.hls?.bandwidthEstimate ?? 0;
  }

  play() {
    if (!this.initialized) {
      this.initialize();
    }

    this.hls.loadSource(this.videoSource);
    this.native.play();
  }

  updateSize(size: Size) {
    if (this.initialized) {
      this.native.width = size.width;
      this.native.height = size.height;
      this.native.style.width = `${size.width}px`;
      this.native.style.height = `${size.height}px`;
    }
  }

  protected lateUpdate(dt: number): void {
    this.currentTime += dt;

    if (Math.abs(this.currentTime - this.videoCurrentTime) > 1) {
      this.syncCurrentTime();
    }
  }

  protected onLoad(): void {
    // this.initialize();
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  protected onDestroy(): void {
    if (this.initialized) {
      this.native.removeEventListener(
        "timeupdate",
        this.syncVideoCurrentTime.bind(this),
      );
      window.removeEventListener("resize", this.handleResize.bind(this));

      this.hls.detachMedia();
      this.hls.destroy();
    }
  }

  private syncCurrentTime() {
    if (this.initialized) {
      this.native.currentTime = this.currentTime;
    }
  }

  private syncVideoCurrentTime() {
    if (this.initialized) {
      this.videoCurrentTime = this.native.currentTime;
    }
  }

  private handleResize() {
    const container = document.getElementById("Cocos3dGameContainer");
    const size = container.getBoundingClientRect();

    if (this.initialized) {
      this.native.style.width = `${size.width}px`;
      this.native.style.height = `${size.height}px`;
    }
  }

  private createOrLoadVideoElement(): HTMLVideoElement {
    const videoId = "video-player";
    const container = document.getElementById("Cocos3dGameContainer");
    const game = document.getElementById("GameCanvas");
    const video = document.getElementById(videoId) as HTMLVideoElement;

    if (game) {
      game.style.zIndex = "11";
      game.style.position = "relative";
    }

    if (!video) {
      const video = document.createElement("video");
      const size = container.getBoundingClientRect();

      video.id = videoId;

      video.style.visibility = "visible";
      video.style.position = "absolute";
      video.style.bottom = "0px";
      video.style.left = "0px";
      video.style.width = `${size.width}px`;
      video.style.height = `${size.height}px`;
      video.style.zIndex = "10";

      container.insertBefore(video, container.firstChild);

      return video;
    }

    return video;
  }

  private initialize() {
    const video = this.createOrLoadVideoElement();

    if (!Hls.isSupported()) {
      throw new Error("Hls.js is not supported.");
    }

    const hls = new Hls();

    hls.attachMedia(video);

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.log("[Hls.Error]: ", event, data);

      this.syncCurrentTime();
    });

    video.addEventListener("timeupdate", this.syncVideoCurrentTime.bind(this));

    this.native = video;
    this.hls = hls;
  }
}

import { _decorator, Component, Label, size } from "cc";
import { VideoPlayer } from "./VideoPlayer";

const { ccclass, property } = _decorator;

@ccclass("Main")
export class Main extends Component {
  @property(VideoPlayer)
  protected player: VideoPlayer = null;

  @property(Label)
  private bandwidth: Label = null;

  private timer = 0;

  private videoSource240p = "";
  private videoSource720p = "";
  private currentTime = 0;

  private lastAction = "";

  protected onLoad(): void {
    const socket = io("wss://game-streaming-service-demo.lumigame.com");

    socket.on("error", (error) => {
      console.error(error);
    });

    socket.on("joinGame", (data) => {
      this.currentTime = data.currentTime;
      this.videoSource240p = data.videoUrl["240p"];
      this.videoSource720p = data.videoUrl["720p"];
    });

    socket.on("syncVideo", (data) => {
      this.currentTime = data.currentTime;
      this.player.currentTime = this.currentTime;
    });

    socket.on("gameResult", (data) => {
      this.videoSource240p = data.videoUrl["240p"];
      this.videoSource720p = data.videoUrl["720p"];
      this.currentTime = 0;

      if (this.lastAction) {
        this[this.lastAction]();
      }
    });
  }

  onClick720p() {
    this.lastAction = "onClick720p";
    // this.player.updateSize(size(854, 480));
    this.player.videoSource = this.videoSource720p;
    this.player.currentTime = this.currentTime;
  }

  onClick240p() {
    this.lastAction = "onClick240p";
    // this.player.updateSize(size(426, 240));
    this.player.videoSource = this.videoSource240p;
    this.player.currentTime = this.currentTime;
  }

  protected lateUpdate(dt: number): void {
    this.currentTime = this.currentTime + dt;

    if (this.timer >= 5) {
      this.timer = 0;
      const bandwidth = (this.player.bandwidthEstimate / 1000) >> 0;

      this.bandwidth.string = `${bandwidth.toLocaleString("en-US")} kbps`;

      if (Math.abs(this.player.currentTime - this.currentTime) >= 1) {
        this.player.currentTime = this.currentTime;
      }
    }

    this.timer += dt;
  }
}

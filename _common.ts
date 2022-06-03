export type Solver = (input: string) => number | Promise<number>;

export interface Config {
  submit: boolean;
  concurrency: boolean;
  resultsInOrder: boolean;
}

export const defaultConfig: Config = {
  submit: false,
  concurrency: false,
  resultsInOrder: true,
};

export abstract class Aocm {
  protected config: Config;
  private tasksComplete = Promise.resolve();

  constructor(config: Partial<Config>) {
    this.config = { ...defaultConfig, ...config };
  }

  async runPart(
    year: number,
    day: number,
    part: number,
    solver: Solver,
  ): Promise<void> {
    if (this.config.submit) {
      // TODO
      console.warn("Answer submitting is not implemented yet");
    }
    const inputPromise = this.getInput(year, day);
    let runAndGetResultShower = async (): Promise<() => void> => {
      const input = await inputPromise;
      const answer = await solver(input);

      return () => {
        console.log(`${year} Day ${day} Part ${part}: ${answer}`);
      };
    };

    if (this.config.concurrency && !this.config.resultsInOrder) {
      const showResult = await runAndGetResultShower();
      showResult();
    } else {
      if (this.config.resultsInOrder) {
        const showResultPromise = runAndGetResultShower();
        runAndGetResultShower = () => showResultPromise;
      }
      this.tasksComplete = this.tasksComplete.then(async () => {
        const showResult = await runAndGetResultShower();
        showResult();
      });
      await this.tasksComplete;
    }
  }

  abstract getInput(year: number, day: number): Promise<string>;
}

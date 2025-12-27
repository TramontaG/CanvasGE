import { GameObject } from "../../GameObject";
import { Vector } from "../../Lib/Vector";
import { Text } from "../../GameObject/Library/Text";

class GoldDisplay extends GameObject {
  private balance: number = 0;
  private total: number = 0;
  private label: Text;

  constructor(position: Vector) {
    super("GoldDisplay", position);

    this.label = new Text("GoldDisplayText", Vector.zero(), this.formatText(), {
      color: "#f2d14b",
      size: "18px",
      align: "center",
    });
    this.label.setPositionRelativeToMotherShip(true);
    this.addChild(this.label);
  }

  private formatText(): string {
    return `Balance: ${this.balance} | Total: ${this.total}`;
  }

  setTotals(balance: number, total: number): void {
    this.balance = balance;
    this.total = total;
    this.label.setText(this.formatText());
  }

  addGold(amount: number): void {
    this.setTotals(this.balance + amount, this.total + amount);
  }

  getBalance(): number {
    return this.balance;
  }

  getTotal(): number {
    return this.total;
  }
}

export { GoldDisplay };

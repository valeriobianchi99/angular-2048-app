// Imports
import { Component } from '@angular/core';

// Decorator 
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

/*** Start of component class ***/
export class AppComponent {

  // Properties (arrays)
  boxNumbers: any[] = [];

  // Rows of the grid
  first = [];
  second = [];
  third = [];
  fourth = [];

  //Flags
  win: boolean = false;
  lost: boolean = true;

  // Points
  points = 0;
  record = 0;

  // Classes of number boxes, associated with CSS
  readonly classes: Object = {
    '2': 'two',
    '4': 'four',
    '8': 'eight',
    '16': 'sixteen',
    '32': 'trtwo',
    '64': 'sxfour',
    '128': 'hun28',
    '256': 'twohun56',
    '512': 'fivehun12',
    '1024': 'thu24',
    '2048': 'twothu48'
  }

  // Class constructor
  constructor() {
    // Setting initial values
    this.boxNumbers.length = 16;
    this.newGame();
	if(localStorage.getItem('record')){
		this.record = parseInt(localStorage.getItem('record'));
	}
  }

  // Start new game with random allocation
  newGame(): void {
    // Restore flags
    this.win = false;
    this.lost = false;
    this.points = 0;
    // New array to populate
    var newArray = [];
    newArray.length = 16;
    for (var i = 0; i < 8; i++) {
      // Random population of grid
      var boxN = Math.floor(Math.random() * (16));
      var startN = Math.random();
      if (startN <= 0.7) newArray[boxN] = 2;
      else if (startN > 0.7) newArray[boxN] = null;
    }
    this.boxNumbers = newArray;
    // Slicing in rows
    this.first = this.boxNumbers.slice(0, 4);
    this.second = this.boxNumbers.slice(4, 8);
    this.third = this.boxNumbers.slice(8, 12);
    this.fourth = this.boxNumbers.slice(12, 16);
    // At least 4 elements
    if(this.countElements()<=3) this.newGame();
  }

  // Searchs for 2048
  checkWin() {
    if (this.boxNumbers.find(el => el == 2048)) this.win = true;
  }

  // CHeck status of points, win or lost
  checkGame() {
    if (this.points > this.record || !this.record) {
      // New best record
      localStorage.setItem('record', this.points.toString());
      this.record = parseInt(localStorage.getItem('record'));
    }
    if (this.countElements() == 16 && this.finishGame()) {
      // Lost game
      this.lost = true;
    }
    else {
      // Controls win
      this.checkWin();
    }
  }

  // Checks if there are numbers to sum near the cells, when the grid is full
  finishGame(): boolean {
    // Count of 'still valid' elements
    var count = 0;
    this.boxNumbers = this.first.concat(this.second.concat(this.third.concat(this.fourth)));
    for (let i = 0; i < this.boxNumbers.length; i++) {
      if ((this.boxNumbers[i + 4] && this.boxNumbers[i + 4] == this.boxNumbers[i]) || (this.boxNumbers[i + 1] && this.boxNumbers[i + 1] == this.boxNumbers[i])) {
        count++;
      }
    }
    return count == 0;
  }

  // Counts the not-null elements in the grid
  countElements(): Number {
    var count = 0;
    this.boxNumbers = this.first.concat(this.second.concat(this.third.concat(this.fourth)));
    for (var i = 0; i < this.boxNumbers.length; i++) {
      if (this.boxNumbers[i]) count++;
    }
    return count;
  }

  // Moves to right the elements of an array
  moveRight(array: any[]) {
    // newArray with all the not-null elements of the row
    var newArray = array.filter(el => el != null);
    var nullArray = [];
    // All the null elements of the row here
    for (let i = 0; i < (array.length-newArray.length); i++) {
      nullArray.push(null);
    }
    // Replaces array with right-pushed elements
    array = [...nullArray, ...newArray];
    // Then tries to sum elements to right direction
    for (let i = array.length-1; i >=0; i--) {
      if (array[i] && array[i - 1] == array[i]) {
        array[i] *= 2;
        // Adds points
        this.points += array[i];
        array[i-1] = null;
      }
    }
    return array;
  }

  // Moves to left the elements of an array
  moveLeft(array: any[]) {
    // newArray with all the not-null elements of the row
    var newArray = array.filter(el => el != null);
    var nullArray = [];
    // All the null elements of the row here
    for (let i = 0; i < (array.length-newArray.length); i++) {
      nullArray.push(null);
    }
    // Replaces array with right-pushed elements
    array = [...newArray, ...nullArray];
    // Then tries to sum elements to right direction
    for (let i = 0; i < array.length; i++) {
      if (array[i] && array[i - 1] == array[i]) {
        array[i - 1] *= 2;
        // Adds points
        this.points += array[i - 1];
        array[i] = null;
      }
    }
    return array;
  }

  // Mixes arr2 into arr1
  mix(arr1: any[], arr2: any[]) {
    for(let i= 0; i<arr1.length; i++){
      // Sum
      if(arr1[i] && arr1[i]==arr2[i]){
        arr1[i]*=2;
        arr2[i]=null;
      }
      // Push top if arr1[i] is null
      else{
        if(!arr1[i] && arr2[i]){
          arr1[i]=arr2[i];
          arr2[i]=null;
        }
      }
    }
    return arr1;
  }

  // Pushes elements top
  pushTop(): void {
    // Mixing rows
    this.first = this.mix(this.first, this.second);
    this.second = this.mix(this.second, this.third);
    this.third = this.mix(this.third, this.fourth);
    // Refreshing of fourth row
    this.refreshRow('fourth');
    this.boxNumbers = this.first.concat(this.second.concat(this.third.concat(this.fourth)));
  }

  // Pushes elements right
  pushRight(): void {
    // Moving right rows
    this.first = this.moveRight(this.first);
    this.second = this.moveRight(this.second);
    this.third = this.moveRight(this.third);
    this.fourth = this.moveRight(this.fourth);
    // Refreshing left column
    this.refreshCol('left');
    this.boxNumbers = this.first.concat(this.second.concat(this.third.concat(this.fourth)));
  }

  // Pushes elements right
  pushLeft(): void {
    // Moving left rows
    this.first = this.moveLeft(this.first);
    this.second = this.moveLeft(this.second);
    this.third = this.moveLeft(this.third);
    this.fourth = this.moveLeft(this.fourth);
    // Refreshing right column
    this.refreshCol('right');
    this.boxNumbers = this.first.concat(this.second.concat(this.third.concat(this.fourth)));
  }

  // Pushes elements down
  pushDown(): void {
    // Mixing rows
    this.fourth = this.mix(this.fourth, this.third);
    this.third = this.mix(this.third, this.second);
    this.second = this.mix(this.second, this.first);
    // Refreshing first row
    this.refreshRow('first');
    this.boxNumbers = this.first.concat(this.second.concat(this.third.concat(this.fourth)));
  }

  // Refreshes empty row
  refreshRow(row: string): void {
    switch (row) {
      // When pushing down
      case 'first':
        for (var i = 0; i < this.first.length; i++) {
          if (this.first[i] == null) {
            // Random population of first row
            let x = Math.random() * 2;
            if (x > 1.3) {
              (x <= 1.85) ? this.first[i] = 2 : this.first[i] = 4;
            }
            else this.first[i] = null;
          }
        }
        break;
      // When pushing top
      case 'fourth':
        for (var i = 0; i < this.fourth.length; i++) {
          if (this.fourth[i] == null) {
            // Random population of fourth row
            let x = Math.random() * 2;
            if (x > 1) {
              (x <= 1.85) ? this.fourth[i] = 2 : this.fourth[i] = 4;
            }
            else this.fourth[i] = null;
          }
        }
      default: break;
    }
  }

  // Refreshes empty column
  refreshCol(column: string): void {
    this.boxNumbers = this.first.concat(this.second.concat(this.third.concat(this.fourth)));
    switch (column) {
      // When pushing right
      case 'left':
        for (let i = 0; i < this.boxNumbers.length; i += 4) {
          if (this.boxNumbers[i] == null) {
            // Random pupulation of left column
            let x = Math.random() * 2;
            if (x > 1) {
              (x <= 1.85) ? this.boxNumbers[i] = 2 : this.boxNumbers[i] = 4;
            }
            else this.boxNumbers[i] = null;
          }
        }
        break;
      // When pushing left
      case 'right':
        for (let i = 3; i < this.boxNumbers.length; i += 4) {
          if (this.boxNumbers[i] == null) {
            // Random population of right column
            let x = Math.random() * 2;
            if (x > 1) {
              (x <= 1.85) ? this.boxNumbers[i] = 2 : this.boxNumbers[i] = 4;
            }
            else this.boxNumbers[i] = null;
          }
        }
        break;
      default: break;
    }
    // Slicing in rows
    this.first = this.boxNumbers.slice(0, 4);
    this.second = this.boxNumbers.slice(4, 8);
    this.third = this.boxNumbers.slice(8, 12);
    this.fourth = this.boxNumbers.slice(12, 16);
  }

}
/*** End of component class ***/
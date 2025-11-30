import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-codigouniversitario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './codigouniversitario.html',
  styleUrls: ['./codigouniversitario.css']
})
export class CodigouniversitarioComponent {
  private dialogRef = inject(MatDialogRef<CodigouniversitarioComponent>);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    codigo: this.fb.control('', {
      validators: [Validators.required, Validators.minLength(5)]
    })
  });

  enviar(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.codigo);
    }
  }


}

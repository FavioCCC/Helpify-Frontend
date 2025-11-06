import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-codigouniversitario',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './codigouniversitario.html',
  styleUrls: ['./codigouniversitario.css']
})
export class CodigouniversitarioComponent {
  private dialogRef = inject(MatDialogRef<CodigouniversitarioComponent>);
  private fb = inject(FormBuilder);

  // Ajusta la validación si tu formato es distinto (ej: /^U\d{7}$/)
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

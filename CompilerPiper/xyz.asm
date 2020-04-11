default rel
section .text
global main
main:
mov rax, 12
cmp rax, 0
je lbl0
mov rax, 34
ret
jmp lbl1
lbl0:
mov rax, 78
ret
lbl1:
mov rax, 56
ret
ret
section .data
import { WHSize, XYPosition } from "@/components/builder/annotate/BaseAnnotate";
import {
    AutoCertAnnotations,
    AutoCertSignatureAnnotate,
    AutoCertTextAnnotate,
} from "@/components/builder/AutoCert";
import { createScopedLogger } from "@/utils/logger";
import { nanoid } from "nanoid";
import { useState } from "react";
import { DocumentCallback, PageCallback } from "react-pdf/src/shared/types.js";

const logger = createScopedLogger("hook:useAutoCert");

export type UseAutoCertProps = {
    initialPdfPage: number;
};

const TextAnnotateWidth = 150;
const TextAnnotateHeight = 40;

const SignatureAnnotateWidth = 200;
const SignatureAnnotateHeight = 50;

// TODO: remove this
const tempSignData = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjcyLjUgMTQuOTUzODQ5NzkyNDgwNDY5IDIyNyAxNDkuNTM0OTQyNjI2OTUzMTIiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmlld0JveD0iMCAwIDQ5OCAxOTgiIHdpZHRoPSI0OTgiIGhlaWdodD0iMTk4Ij48cGF0aCBkPSJNIDc3LjUwMCwxNTEuMDAwIEMgNzkuMDAwLDE0Ni41MDAgNzguMzkyLDE0Ni4yMTYgODAuNTAwLDE0Mi4wMDAiIHN0cm9rZS13aWR0aD0iNS4xMjIiIHN0cm9rZT0iYmxhY2siIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0gODAuNTAwLDE0Mi4wMDAgQyA4My44OTIsMTM1LjIxNiA4NS4zMTQsMTM1LjkwMyA4OC41MDAsMTI5LjAwMCIgc3Ryb2tlLXdpZHRoPSIzLjA5NCIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSA4OC41MDAsMTI5LjAwMCBDIDk0LjMxNCwxMTYuNDAzIDk0LjEwMiwxMTYuMTk0IDk4LjUwMCwxMDMuMDAwIiBzdHJva2Utd2lkdGg9IjIuMTI0IiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNIDk4LjUwMCwxMDMuMDAwIEMgMTAxLjYwMiw5My42OTQgMTAwLjkxNSw5My40NzcgMTAzLjUwMCw4NC4wMDAiIHN0cm9rZS13aWR0aD0iMi41NTEiIHN0cm9rZT0iYmxhY2siIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0gMTAzLjUwMCw4NC4wMDAgQyAxMDYuOTE1LDcxLjQ3NyAxMDcuMzU1LDcxLjU4MiAxMTAuNTAwLDU5LjAwMCIgc3Ryb2tlLXdpZHRoPSIyLjE4MCIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxMTAuNTAwLDU5LjAwMCBDIDExMS44NTUsNTMuNTgyIDExMS4yODksNTMuNDUxIDExMi41MDAsNDguMDAwIiBzdHJva2Utd2lkdGg9IjMuMTQ4IiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNIDExMi41MDAsNDguMDAwIEMgMTEzLjI4OSw0NC40NTEgMTEzLjExMiw0NC4zMzIgMTE0LjUwMCw0MS4wMDAiIHN0cm9rZS13aWR0aD0iMy43ODAiIHN0cm9rZT0iYmxhY2siIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0gMTE0LjUwMCw0MS4wMDAgQyAxMTUuNjEyLDM4LjMzMiAxMTYuNjQzLDM0Ljk3MiAxMTcuNTAwLDM2LjAwMCIgc3Ryb2tlLXdpZHRoPSI0LjY1NyIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxMTcuNTAwLDM2LjAwMCBDIDExOS4xNDMsMzcuOTcyIDExOC4zMjksNDEuNTM2IDExOS41MDAsNDcuMDAwIiBzdHJva2Utd2lkdGg9IjQuNDIxIiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNIDExOS41MDAsNDcuMDAwIEMgMTIxLjMyOSw1NS41MzYgMTIxLjg3OCw1NS40MjcgMTIzLjUwMCw2NC4wMDAiIHN0cm9rZS13aWR0aD0iMi43MTEiIHN0cm9rZT0iYmxhY2siIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0gMTIzLjUwMCw2NC4wMDAgQyAxMjUuMzc4LDczLjkyNyAxMjQuNDcxLDc0LjEwOSAxMjYuNTAwLDg0LjAwMCIgc3Ryb2tlLXdpZHRoPSIyLjUwNSIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxMjYuNTAwLDg0LjAwMCBDIDEyOC40NzEsOTMuNjA5IDEyOC4xNjEsOTMuODE2IDEzMS41MDAsMTAzLjAwMCIgc3Ryb2tlLXdpZHRoPSIyLjU5OSIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxMzEuNTAwLDEwMy4wMDAgQyAxMzQuMTYxLDExMC4zMTYgMTM0LjMwNywxMTYuMjE0IDEzOC41MDAsMTE3LjAwMCIgc3Ryb2tlLXdpZHRoPSIyLjgxNyIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxMzguNTAwLDExNy4wMDAgQyAxNDIuMzA3LDExNy43MTQgMTQzLjgzOSwxMTIuMDI5IDE0Ny41MDAsMTA2LjAwMCIgc3Ryb2tlLXdpZHRoPSI0LjExNyIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxNDcuNTAwLDEwNi4wMDAgQyAxNTIuMzM5LDk4LjAyOSAxNTIuNDcyLDk3LjgzMiAxNTUuNTAwLDg5LjAwMCIgc3Ryb2tlLXdpZHRoPSIyLjc2OSIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxNTUuNTAwLDg5LjAwMCBDIDE1OC40NzIsODAuMzMyIDE1OC4xNDQsODAuMTA1IDE1OS41MDAsNzEuMDAwIiBzdHJva2Utd2lkdGg9IjIuNjI4IiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNIDE1OS41MDAsNzEuMDAwIEMgMTYxLjY0NCw1Ni42MDUgMTYxLjM4Myw1Ni41MjAgMTYyLjUwMCw0Mi4wMDAiIHN0cm9rZS13aWR0aD0iMi4wNDIiIHN0cm9rZT0iYmxhY2siIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0gMTYyLjUwMCw0Mi4wMDAgQyAxNjIuODgzLDM3LjAyMCAxNjIuNTAwLDM3LjAwMCAxNjIuNTAwLDMyLjAwMCIgc3Ryb2tlLXdpZHRoPSIzLjIzNyIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxNjIuNTAwLDMyLjAwMCBDIDE2Mi41MDAsMjYuMDAwIDE2Mi43MjIsMTkuMzM0IDE2Mi41MDAsMjAuMDAwIiBzdHJva2Utd2lkdGg9IjMuOTg2IiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNIDE2Mi41MDAsMjAuMDAwIEMgMTYyLjIyMiwyMC44MzQgMTYyLjIxMiwyNy41MTkgMTYxLjUwMCwzNS4wMDAiIHN0cm9rZS13aWR0aD0iNC43MTQiIHN0cm9rZT0iYmxhY2siIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0gMTYxLjUwMCwzNS4wMDAgQyAxNjAuMjEyLDQ4LjUxOSAxNjAuMDAwLDQ4LjUwMCAxNTguNTAwLDYyLjAwMCIgc3Ryb2tlLXdpZHRoPSIyLjIwOCIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxNTguNTAwLDYyLjAwMCBDIDE1Ny41MDAsNzEuMDAwIDE1Ny4wMzEsNzAuOTc0IDE1Ni41MDAsODAuMDAwIiBzdHJva2Utd2lkdGg9IjIuNTg4IiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNIDE1Ni41MDAsODAuMDAwIEMgMTU2LjAzMSw4Ny45NzQgMTU2LjI2NSw4OC4wMDcgMTU2LjUwMCw5Ni4wMDAiIHN0cm9rZS13aWR0aD0iMi43ODgiIHN0cm9rZT0iYmxhY2siIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0gMTU2LjUwMCw5Ni4wMDAgQyAxNTYuNzY1LDEwNS4wMDcgMTU2LjM1MSwxMDUuMDkyIDE1Ny41MDAsMTE0LjAwMCIgc3Ryb2tlLXdpZHRoPSIyLjY1OSIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxNTcuNTAwLDExNC4wMDAgQyAxNTguMzUxLDEyMC41OTIgMTU4Ljg4MiwxMjAuNTMwIDE2MC41MDAsMTI3LjAwMCIgc3Ryb2tlLXdpZHRoPSIzLjA5NCIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxNjAuNTAwLDEyNy4wMDAgQyAxNjEuODgyLDEzMi41MzAgMTY2LjQzOCwxMzUuMDYyIDE2My41MDAsMTM4LjAwMCIgc3Ryb2tlLXdpZHRoPSIzLjI2NCIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxNjMuNTAwLDEzOC4wMDAgQyAxNTguNDM4LDE0My4wNjIgMTU0LjEyMywxNDEuNDQ4IDE0NC41MDAsMTQzLjAwMCIgc3Ryb2tlLXdpZHRoPSI0LjkyOSIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxNDQuNTAwLDE0My4wMDAgQyAxMzguNjIzLDE0My45NDggMTM4LjUwMCwxNDMuMDAwIDEzMi41MDAsMTQzLjAwMCIgc3Ryb2tlLXdpZHRoPSIzLjMzMCIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxMzIuNTAwLDE0My4wMDAgQyAxMzAuMDAwLDE0My4wMDAgMTI2LjIxNywxNDMuNzQ4IDEyNy41MDAsMTQzLjAwMCIgc3Ryb2tlLXdpZHRoPSI0LjE2NiIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxMjcuNTAwLDE0My4wMDAgQyAxMzIuMjE3LDE0MC4yNDggMTM2LjAyMywxMzkuNTU1IDE0NC41MDAsMTM2LjAwMCIgc3Ryb2tlLXdpZHRoPSI0LjQ1OCIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxNDQuNTAwLDEzNi4wMDAgQyAxNTEuNTIzLDEzMy4wNTUgMTUxLjUxMiwxMzMuMDI4IDE1OC41MDAsMTMwLjAwMCIgc3Ryb2tlLXdpZHRoPSIyLjk4NyIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxNTguNTAwLDEzMC4wMDAgQyAxNjYuNTEyLDEyNi41MjggMTY2LjQ0OCwxMjYuMzc3IDE3NC41MDAsMTIzLjAwMCIgc3Ryb2tlLXdpZHRoPSIyLjcxNyIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxNzQuNTAwLDEyMy4wMDAgQyAxODEuOTQ4LDExOS44NzcgMTg1LjQyNiwxMTcuNzQxIDE4OS41MDAsMTE3LjAwMCIgc3Ryb2tlLXdpZHRoPSIyLjc5MCIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxODkuNTAwLDExNy4wMDAgQyAxOTAuOTI2LDExNi43NDEgMTg3LjUwMCwxMTkuMDAwIDE4NS41MDAsMTIxLjAwMCIgc3Ryb2tlLXdpZHRoPSI0LjgxNyIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxODUuNTAwLDEyMS4wMDAgQyAxODIuMDAwLDEyNC41MDAgMTgyLjEwMywxMjQuNjA5IDE3OC41MDAsMTI4LjAwMCIgc3Ryb2tlLXdpZHRoPSIzLjU3NSIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxNzguNTAwLDEyOC4wMDAgQyAxNzMuNjAzLDEzMi42MDkgMTczLjU0NCwxMzIuNTUwIDE2OC41MDAsMTM3LjAwMCIgc3Ryb2tlLXdpZHRoPSIzLjEwMSIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxNjguNTAwLDEzNy4wMDAgQyAxNjUuMDQ0LDE0MC4wNTAgMTY0LjIzOCwxMzkuNDQwIDE2MS41MDAsMTQzLjAwMCIgc3Ryb2tlLXdpZHRoPSIzLjU4NCIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxNjEuNTAwLDE0My4wMDAgQyAxNTkuMjM4LDE0NS45NDAgMTU2Ljg2OCwxNDguNzc2IDE1OC41MDAsMTUwLjAwMCIgc3Ryb2tlLXdpZHRoPSIzLjc4NyIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxNTguNTAwLDE1MC4wMDAgQyAxNjAuODY4LDE1MS43NzYgMTYzLjk5MiwxNDkuMzI0IDE2OS41MDAsMTQ5LjAwMCIgc3Ryb2tlLXdpZHRoPSI0Ljc1NSIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxNjkuNTAwLDE0OS4wMDAgQyAxNzIuNDkyLDE0OC44MjQgMTcyLjUyMSwxNDguNzUyIDE3NS41MDAsMTQ5LjAwMCIgc3Ryb2tlLXdpZHRoPSI0Ljc1OSIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxNzUuNTAwLDE0OS4wMDAgQyAxNzguNTIxLDE0OS4yNTIgMTgyLjYxMywxNDkuNjgyIDE4MS41MDAsMTUwLjAwMCIgc3Ryb2tlLXdpZHRoPSI0LjczMCIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxODEuNTAwLDE1MC4wMDAgQyAxNzkuMTEzLDE1MC42ODIgMTc1LjAwOSwxNTAuNzQwIDE2OC41MDAsMTUxLjAwMCIgc3Ryb2tlLXdpZHRoPSI0LjkwMCIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxNjguNTAwLDE1MS4wMDAgQyAxNjIuNTA5LDE1MS4yNDAgMTYyLjUwMCwxNTEuMDAwIDE1Ni41MDAsMTUxLjAwMCIgc3Ryb2tlLXdpZHRoPSIzLjMyOSIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxNTYuNTAwLDE1MS4wMDAgQyAxNTIuNTAwLDE1MS4wMDAgMTUyLjQ1OCwxNTAuNTI1IDE0OC41MDAsMTUxLjAwMCIgc3Ryb2tlLXdpZHRoPSIzLjc2OSIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxNDguNTAwLDE1MS4wMDAgQyAxMzkuOTU4LDE1Mi4wMjUgMTQwLjAwNywxNTIuNTQyIDEzMS41MDAsMTU0LjAwMCIgc3Ryb2tlLXdpZHRoPSIyLjc4NCIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxMzEuNTAwLDE1NC4wMDAgQyAxMjIuNTA3LDE1NS41NDIgMTIyLjUyMywxNTUuNjYzIDExMy41MDAsMTU3LjAwMCIgc3Ryb2tlLXdpZHRoPSIyLjY0MyIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxMTMuNTAwLDE1Ny4wMDAgQyAxMDkuMDIzLDE1Ny42NjMgMTA4Ljk3OCwxNTcuMzYwIDEwNC41MDAsMTU4LjAwMCIgc3Ryb2tlLXdpZHRoPSIzLjUzMyIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTSAxMDQuNTAwLDE1OC4wMDAgQyAxMDEuOTc4LDE1OC4zNjAgOTkuNTAwLDE2MC40MDkgOTkuNTAwLDE1OS4wMDAiIHN0cm9rZS13aWR0aD0iNC4xMjAiIHN0cm9rZT0iYmxhY2siIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0gOTkuNTAwLDE1OS4wMDAgQyA5OS41MDAsMTU1LjkwOSAxMDAuNzE3LDE1Mi45NDggMTA0LjUwMCwxNDkuMDAwIiBzdHJva2Utd2lkdGg9IjQuOTU1IiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNIDEwNC41MDAsMTQ5LjAwMCBDIDExMi4yMTcsMTQwLjk0OCAxMTMuMTM0LDE0MS40ODQgMTIyLjUwMCwxMzUuMDAwIiBzdHJva2Utd2lkdGg9IjIuNDUwIiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNIDEyMi41MDAsMTM1LjAwMCBDIDEzOS4xMzQsMTIzLjQ4NCAxMzguODk0LDEyMi45NjYgMTU2LjUwMCwxMTMuMDAwIiBzdHJva2Utd2lkdGg9IjEuNjUxIiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNIDE1Ni41MDAsMTEzLjAwMCBDIDE5MS44OTQsOTIuOTY2IDE5MS45MzksOTIuODIwIDIyOC41MDAsNzUuMDAwIiBzdHJva2Utd2lkdGg9IjEuMTI1IiBzdHJva2U9ImJsYWNrIiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNIDIyOC41MDAsNzUuMDAwIEMgMjUxLjQzOSw2My44MjAgMjUxLjk4OSw2NC45NzQgMjc1LjUwMCw1NS4wMDAiIHN0cm9rZS13aWR0aD0iMS4zMDAiIHN0cm9rZT0iYmxhY2siIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0gMjc1LjUwMCw1NS4wMDAgQyAyODQuOTg5LDUwLjk3NCAyODQuNTQzLDQ5LjQwOSAyOTQuNTAwLDQ3LjAwMCIgc3Ryb2tlLXdpZHRoPSIyLjI1NyIgc3Ryb2tlPSJibGFjayIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+PC9zdmc+"

export default function useAutoCert({ initialPdfPage = 1 }: UseAutoCertProps) {
    const [totalPdfPage, setTotalPdfPage] = useState<number>(0);
    const [annotations, setAnnotations] = useState<AutoCertAnnotations>({});
    const [currentPdfPage, setCurrentPdfPage] = useState<number>(initialPdfPage);

    const onDocumentLoadSuccess = async (
        pdf: DocumentCallback
    ): Promise<void> => {
        logger.debug(`Pdf loaded, total pages: ${pdf.numPages}`);

        setTotalPdfPage(pdf.numPages);
        setCurrentPdfPage(initialPdfPage);

        if (process.env.NODE_ENV !== "production") {
            const page = await pdf.getPage(1);
            const width = page.view[2];
            const height = page.view[3];
            logger.debug(`Pdf width: ${width}, height: ${height}`);
        }
    };

    const onPageLoadSuccess = async (page: PageCallback): Promise<void> => {
        logger.debug(
            `Page original size ${page.originalWidth}x${page.originalHeight}, Scaled size ${page.width}x${page.height}`
        );
    };

    const addTextField = (): void => {
        logger.debug("Adding text field");

        const newTextField = {
            id: nanoid(),
            type: "text",
            x: 100,
            y: 100,
            value: "Enter Text",
            width: TextAnnotateWidth,
            height: TextAnnotateHeight,
        } satisfies AutoCertTextAnnotate;

        setAnnotations((prev) => ({
            ...prev,
            // Add the new text field to the current page
            [currentPdfPage]: [...(prev[currentPdfPage] || []), newTextField],
        }));
    };

    const addSignatureField = (): void => {
        logger.debug("Adding signature field");

        const newSignatureField = {
            id: nanoid(),
            type: "signature",
            x: 100,
            y: 100,
            // signatureData: "",
            signatureData: tempSignData,
            width: SignatureAnnotateWidth,
            height: SignatureAnnotateHeight,
        } satisfies AutoCertSignatureAnnotate;

        setAnnotations((prev) => ({
            ...prev,
            // Add the new signature field to the current page
            [currentPdfPage]: [
                ...(prev[currentPdfPage] || []),
                newSignatureField,
            ],
        }));
    };

    const handleResizeStop = (
        id: string,
        size: WHSize,
        position: XYPosition
    ): void => {
        logger.debug(
            `Resize annotation, w:${size.width}, h:${size.height},  Position: x:${position.x}, y:${position.y} dpi: ${window.devicePixelRatio}`
        );

        setAnnotations((prev) => ({
            ...prev,
            [currentPdfPage]: (prev[currentPdfPage] || []).map((annotation) =>
                annotation.id === id
                    ? { ...annotation, ...size, ...position }
                    : annotation
            ),
        }));
    };

    const handleDragStop = (
        id: string,
        _e: any,
        position: XYPosition
    ): void => {
        logger.debug(
            `Drag annotation, Position: x:${position.x}, y:${position.y}`
        );

        setAnnotations((prev) => ({
            ...prev,
            [currentPdfPage]: (prev[currentPdfPage] || []).map((annotation) =>
                annotation.id === id
                    ? { ...annotation, ...position }
                    : annotation
            ),
        }));
    };

    return {
        annotations,
        currentPdfPage,
        totalPdfPage,
        onDocumentLoadSuccess,
        onPageLoadSuccess,
        setTotalPdfPage,
        setCurrentPdfPage,
        setAnnotations,
        addTextField,
        addSignatureField,
        handleResizeStop,
        handleDragStop,
    };
}
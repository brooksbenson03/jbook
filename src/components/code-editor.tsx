import { useRef } from 'react'
import MonacoEditor, { EditorDidMount } from '@monaco-editor/react'
import prettier from 'prettier'
import parser from 'prettier/parser-babel'
import codeShift from 'jscodeshift'
import Highlighter from 'monaco-jsx-highlighter'
import './code-editor.css'
import './syntax.css'

interface CodeEditorProps {
  handleChange: (mutation: string) => void
  initialValue: string
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  handleChange,
  initialValue
}) => {
  const editorRef = useRef<any>()

  const onEditorDidMount: EditorDidMount = (getValue, editor) => {
    editorRef.current = editor

    editor.onDidChangeModelContent(() => {
      handleChange(getValue())
    })

    editor.getModel()?.updateOptions({ tabSize: 2 })

    const highlighter = new Highlighter(
      // @ts-ignore
      window.monaco,
      codeShift,
      editor
    )

    highlighter.highLightOnDidChangeModelContent(
      () => {},
      () => {},
      undefined,
      () => {}
    )
  }

  const onFormatClick = () => {
    const unformatted = editorRef.current.getModel().getValue()
    const formatted = prettier
      .format(unformatted, {
        parser: 'babel',
        plugins: [parser],
        useTabs: false,
        semi: false,
        singleQuote: true
      })
      .replace(/\n$/, '')
    editorRef.current.setValue(formatted)
  }

  return (
    <div className="editor-wrapper">
      <button
        className="button button-format is-primary button-is-small"
        onClick={onFormatClick}
      >
        Format
      </button>
      <MonacoEditor
        editorDidMount={onEditorDidMount}
        height="100%"
        language="javascript"
        theme="dark"
        options={{
          automaticLayout: true,
          folding: false,
          fontSize: 16,
          lineNumbersMinChars: 3,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          showUnused: false,
          wordWrap: 'on'
        }}
        value={initialValue}
      />
    </div>
  )
}

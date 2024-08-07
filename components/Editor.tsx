"use client";

import { useEffect, useCallback, memo, Fragment } from "react";
import { download } from "@/lib/download";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import CodeMirror from "@uiw/react-codemirror";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Footer from "@/components/footer";
import { Button } from "./ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { cmOptions } from "@/lib/Options";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import useCodes from "@/hooks/useCodes";
import useHtml from "@/hooks/useHtml";
import useCss from "@/hooks/useCss";
import useJs from "@/hooks/useJs";
import { Extension } from "@codemirror/state";

interface EditorProps {}

const codeTypes = ["html", "css", "javascript"];

const Editor: React.FC<EditorProps> = () => {
  const { html, setHtmlValue } = useHtml();
  const { css, setCssValue } = useCss();
  const { js, setJsValue } = useJs();
  const { codes, setCodesValue } = useCodes();

  const handleDownload = useCallback(() => {
    download({ src: codes });
    toast.success("Downloaded!");
  }, [codes]);

  const compileCode = useCallback(() => {
    setCodesValue(`
      <!DOCTYPE html>
      <html lang="en">
          <head></head>
          <style>* { margin: 0; padding: 0; box-sizing: border-box; }${css}</style>
          <body>
              <div>${html}</div>
              <script>${js}</script>
          </body>
      </html>
    `);
  }, [html, css, js, setCodesValue]);

  useEffect(() => {
    compileCode();
  }, [html, css, js, compileCode]);

  const handleChange = useCallback((val: string, type: string) => {
    if (type === "html") setHtmlValue(val);
    else if (type === "css") setCssValue(val);
    else setJsValue(val);
  }, [setHtmlValue, setCssValue, setJsValue]);

  const renderCodePanel = useCallback(
    (type: string) => (
      <ResizablePanel key={type} defaultSize={100}>
        <ScrollArea className="h-full w-full">
          <div className="p-2 bg-black text-light-500">
            <h3 className="text-lg font-semibold">{type.toUpperCase()}</h3>
          </div>
          <ScrollArea className="h-full w-full">
            <CodeMirror
              {...cmOptions}
              value={type === "html" ? html : type === "css" ? css : js}
              placeholder={type.toUpperCase()}
              onChange={(val) => handleChange(val, type)}
              extensions={[loadLanguage(type as "html" | "css" | "javascript") as Extension]}
            />
          </ScrollArea>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </ResizablePanel>
    ),
    [html, css, js, handleChange]
  );

  return (
    <ResizablePanelGroup direction="vertical" className="absolute h-full w-full top-0 left-0 right-0">
      <ResizablePanel defaultSize={100}>
        <ResizablePanelGroup direction="horizontal">
          {codeTypes.map((type) => (
            <Fragment key={type}>
              {renderCodePanel(type)}
              <ResizableHandle withHandle />
            </Fragment>
          ))}
        </ResizablePanelGroup>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={100} className="p-0 m-0">
        <iframe
          className={"h-full w-full p-0 m-0 bg-white"}
          srcDoc={codes}
        />
      </ResizablePanel>
      <Footer
        onClear={() => {
          setHtmlValue("");
          setCssValue("");
          setJsValue("");
          setCodesValue("");
        }}
      >
        <Button
          size="icon"
          variant="secondary"
          onClick={handleDownload}
        >
          <Save className="h-4 w-4" />
        </Button>
      </Footer>
    </ResizablePanelGroup>
  );
};

export default memo(Editor);

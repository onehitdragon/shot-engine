#define UNICODE
#define _UNICODE

#include <windows.h>
#include <windowsx.h>
#include <iostream>
#include <d3d11.h>
#include <d3dx9.h>
#include <d3dcompiler.h>

#define SCREEN_WIDTH  800
#define SCREEN_HEIGHT 600

struct VERTEX
{
    float x, y, z;      // position
    D3DXCOLOR color;    // color
};

// global declarations
IDXGISwapChain *swapchain;             // the pointer to the swap chain interface
ID3D11Device *dev;                     // the pointer to our Direct3D device interface
ID3D11DeviceContext *devcon;           // the pointer to our Direct3D device context
ID3D11RenderTargetView *backbuffer;
ID3D11VertexShader *pVS;    // the vertex shader
ID3D11PixelShader *pPS;     // the pixel shader
ID3D11Buffer *pVBuffer;
ID3D11InputLayout *pLayout;
void InitD3D(HWND hWnd);     // sets up and initializes Direct3D
void CleanD3D(void);         // closes Direct3D and releases memory
void RenderFrame();
void InitGraphics();
void InitPipeline();

LRESULT CALLBACK WindowProc(
    HWND hWnd,
    UINT message,
    WPARAM wParam,
    LPARAM lParam
);

int WINAPI WinMain(
    HINSTANCE hInstance,
    HINSTANCE hPrevInstance,
    LPSTR lpCmdLine,
    int nCmdShow
){
    WNDCLASSEX wc;
    ZeroMemory(&wc, sizeof(WNDCLASSEX));
    wc.cbSize = sizeof(WNDCLASSEX);
    wc.style = CS_HREDRAW | CS_VREDRAW;
    wc.lpfnWndProc = WindowProc;
    wc.hInstance = hInstance;
    wc.hCursor = LoadCursor(NULL, IDC_ARROW);
    wc.hbrBackground = (HBRUSH)COLOR_WINDOW;
    wc.lpszClassName = L"WindowClass1";
    RegisterClassEx(&wc);

    RECT wr = {0, 0, SCREEN_WIDTH, SCREEN_HEIGHT};
    AdjustWindowRect(&wr, WS_OVERLAPPEDWINDOW, FALSE);
    HWND hWnd = CreateWindowEx(
        0,
        L"WindowClass1",    // name of the window class
        L"Our First Windowed Program",   // title of the window
        WS_OVERLAPPEDWINDOW,    // window style
        50,    // x-position of the window
        50,    // y-position of the window
        wr.right - wr.left,    // width of the window
        wr.bottom - wr.top,    // height of the window
        NULL,    // we have no parent window, NULL
        NULL,    // we aren't using menus, NULL
        hInstance,    // application handle
        NULL    // used with multiple windows, NULL
    );
    ShowWindow(hWnd, nCmdShow);
    InitD3D(hWnd);
    InitGraphics();
    InitPipeline();

    MSG msg;
    while(true){
        if(PeekMessage(&msg, NULL, 0, 0, PM_REMOVE))
        {
            TranslateMessage(&msg);
            DispatchMessage(&msg);
            if(msg.message == WM_QUIT){
                break;
            }
        }
        RenderFrame();
    }
    CleanD3D();
    return msg.wParam;
}

LRESULT CALLBACK WindowProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam)
{
    switch(message)
    {
        case WM_DESTROY:
            {
                PostQuitMessage(0);
                return 0;
            }
    }
    return DefWindowProc (hWnd, message, wParam, lParam);
}

void InitD3D(HWND hWnd)
{
    DXGI_SWAP_CHAIN_DESC scd;
    ZeroMemory(&scd, sizeof(DXGI_SWAP_CHAIN_DESC));
    scd.BufferCount = 1;                                    // one back buffer
    scd.BufferDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;     // use 32-bit color
    scd.BufferUsage = DXGI_USAGE_RENDER_TARGET_OUTPUT;      // how swap chain is to be used
    scd.OutputWindow = hWnd;                                // the window to be used
    scd.SampleDesc.Count = 4;                               // how many multisamples
    scd.Windowed = TRUE;
    D3D11CreateDeviceAndSwapChain(
        nullptr,
        D3D_DRIVER_TYPE_HARDWARE,
        nullptr,
        0,
        nullptr,
        0,
        D3D11_SDK_VERSION,
        &scd,
        &swapchain,
        &dev,
        nullptr,
        &devcon
    );

    ID3D11Texture2D *pBackBuffer;
    swapchain->GetBuffer(0, __uuidof(ID3D11Texture2D), (LPVOID*)&pBackBuffer);
    dev->CreateRenderTargetView(pBackBuffer, NULL, &backbuffer);
    pBackBuffer->Release();
    devcon->OMSetRenderTargets(1, &backbuffer, NULL);

    D3D11_VIEWPORT viewport;
    ZeroMemory(&viewport, sizeof(D3D11_VIEWPORT));
    viewport.TopLeftX = 0;
    viewport.TopLeftY = 0;
    viewport.Width = SCREEN_WIDTH;
    viewport.Height = SCREEN_HEIGHT;
    devcon->RSSetViewports(1, &viewport);
}
void CleanD3D()
{
    pLayout->Release();
    pVBuffer->Release();
    pVS->Release();
    pPS->Release();
    backbuffer->Release();
    swapchain->Release();
    dev->Release();
    devcon->Release();
}
void RenderFrame()
{
    // clear the back buffer to a deep blue
    devcon->ClearRenderTargetView(backbuffer, D3DXCOLOR(0.0f, 0.2f, 0.4f, 1.0f));

    // do 3D rendering on the back buffer here
    // select which vertex buffer to display
    UINT stride = sizeof(VERTEX);
    UINT offset = 0;
    devcon->IASetVertexBuffers(0, 1, &pVBuffer, &stride, &offset);

    // select which primtive type we are using
    devcon->IASetPrimitiveTopology(D3D10_PRIMITIVE_TOPOLOGY_TRIANGLELIST);

    // draw the vertex buffer to the back buffer
    devcon->Draw(3, 0);

    // switch the back buffer and the front buffer
    swapchain->Present(0, 0);
}
void InitGraphics(){
    VERTEX OurVertices[] =
    {
        {0.0f, 0.5f, 0.0f, D3DXCOLOR(1.0f, 0.0f, 0.0f, 1.0f)},
        {0.45f, -0.5, 0.0f, D3DXCOLOR(0.0f, 1.0f, 0.0f, 1.0f)},
        {-0.45f, -0.5f, 0.0f, D3DXCOLOR(0.0f, 0.0f, 1.0f, 1.0f)}
    };

    D3D11_BUFFER_DESC bd;
    ZeroMemory(&bd, sizeof(bd));
    bd.Usage = D3D11_USAGE_DYNAMIC;                // write access access by CPU and GPU
    bd.ByteWidth = sizeof(VERTEX) * 3000000;             // size is the VERTEX struct * 3
    bd.BindFlags = D3D11_BIND_VERTEX_BUFFER;       // use as a vertex buffer
    bd.CPUAccessFlags = D3D11_CPU_ACCESS_WRITE;    // allow CPU to write in buffer
    dev->CreateBuffer(&bd, NULL, &pVBuffer);       // create the buffer

    D3D11_MAPPED_SUBRESOURCE ms;
    devcon->Map(pVBuffer, 0, D3D11_MAP_WRITE_DISCARD, 0, &ms);   // map the buffer
    memcpy(ms.pData, OurVertices, sizeof(OurVertices));                // copy the data
    devcon->Unmap(pVBuffer, 0);                                     // unmap the buffer
}
void InitPipeline(){
    ID3D10Blob *VS, *PS;
    D3DCompileFromFile(L"shader/shaders.shader", nullptr, nullptr, "VShader", "vs_4_0", 0, 0, &VS, nullptr);
    D3DCompileFromFile(L"shader/shaders.shader", nullptr, nullptr, "PShader", "ps_4_0", 0, 0, &PS, nullptr);

    dev->CreateVertexShader(VS->GetBufferPointer(), VS->GetBufferSize(), NULL, &pVS);
    dev->CreatePixelShader(PS->GetBufferPointer(), PS->GetBufferSize(), NULL, &pPS);
    devcon->VSSetShader(pVS, 0, 0);
    devcon->PSSetShader(pPS, 0, 0);

    D3D11_INPUT_ELEMENT_DESC ied[] =
    {
        {"POSITION", 0, DXGI_FORMAT_R32G32B32_FLOAT, 0, 0, D3D11_INPUT_PER_VERTEX_DATA, 0},
        {"COLOR", 0, DXGI_FORMAT_R32G32B32A32_FLOAT, 0, 12, D3D11_INPUT_PER_VERTEX_DATA, 0},
    };
    dev->CreateInputLayout(ied, 2, VS->GetBufferPointer(), VS->GetBufferSize(), &pLayout);
    devcon->IASetInputLayout(pLayout);
}

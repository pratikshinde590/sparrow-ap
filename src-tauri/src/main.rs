// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod config;
mod formdata_handler;
mod json_handler;
mod raw_handler;
mod url_fetch_handler;
mod urlencoded_handler;
use formdata_handler::make_formdata_request;
use json_handler::make_json_request;
use nfd::Response;
use raw_handler::make_text_request;
use reqwest::Client;
use serde_json::json;
use serde_json::Value;
use std::collections::HashMap;
use tauri::Manager;
use url_fetch_handler::import_swagger_url;
use urlencoded_handler::make_www_form_urlencoded_request;
use std::{thread, time};

#[tokio::main]
async fn make_request(
    url: &str,
    method: &str,
    headers: &str,
    body: &str,
    request: &str,
) -> Result<Value, Box<dyn std::error::Error>> {
    // Make a client
    let client = Client::new();
    // Convert the method string to reqwest::Method
    let reqwest_method = match method {
        "GET" => reqwest::Method::GET,
        "POST" => reqwest::Method::POST,
        "PUT" => reqwest::Method::PUT,
        "DELETE" => reqwest::Method::DELETE,
        "PATCH" => reqwest::Method::PATCH,
        // Add other HTTP methods as needed
        _ => reqwest::Method::GET,
    };

    // Convert header string into hashmap
    let header_map: HashMap<_, _> = headers
        .split('&')
        .map(|s| {
            let mut parts = s.split('=');
            (
                parts.next().unwrap().to_owned(),
                parts.next().unwrap_or("").to_owned(),
            )
        })
        .collect();

    let mut request_builder = client.request(reqwest_method, url);

    // Add headers in request builder
    for (key, value) in header_map.iter() {
        request_builder = request_builder.header(key, value);
    }

    let check = match request {
        "JSON" => make_json_request(request_builder, body).await,
        "URLENCODED" => make_www_form_urlencoded_request(request_builder, body).await,
        "FORMDATA" => make_formdata_request(request_builder, body).await,
        "TEXT" => make_text_request(request_builder, body).await,
        _ => make_json_request(request_builder, body).await,
    };
    let response_value = match check {
        Ok(value) => value,
        Err(err) => {
            return Err(err);
        }
    };

    // Extracting Headers, StatusCode & Response
    let headers = response_value.headers().clone();
    let status = response_value.status().clone();
    let response_text = response_value.text().await?;
    let headers_json: serde_json::Value = headers
        .iter()
        .map(|(name, value)| (name.to_string(), value.to_str().unwrap()))
        .collect();

    // Combining all parameters
    let combined_json = json!({
        "headers": headers_json,
        "status": status.to_string(),
        "response": response_text
    });
    return Ok(combined_json);
}

#[tauri::command]
fn make_type_request_command(
    url: &str,
    method: &str,
    headers: &str,
    body: &str,
    request: &str,
) -> String {
    let result = make_request(url, method, headers, body, request);
    let result_value = match result {
        Ok(value) => value.to_string(),
        Err(err) => return err.to_string(),
    };
    return result_value;
}

#[tauri::command]
fn fetch_swagger_url_command(url: &str, headers: &str, workspaceid: &str) -> Value {
    let response = import_swagger_url(url, headers, workspaceid);
    let response_value = match response {
        Ok(value) => value,
        Err(err) => todo!("{}", err),
    };
    return response_value;
}

#[tauri::command]
fn fetch_file_command() -> String {
    let result = nfd::open_file_dialog(None, None).expect("Error opening file dialog");
    let mut response;
    match result {
        Response::Okay(file_path) => {
            response = file_path;
        }
        Response::OkayMultiple(_) => {
            let temp = "Multiple Files Selected";
            response = temp.to_string();
        }
        Response::Cancel => {
            let temp = "Canceled";
            response = temp.to_string();
        }
    }
    return response;
}

#[tauri::command]
async fn create_oauth_window(handle: tauri::AppHandle) {
    tauri::WindowBuilder::new(
        &handle,
        "oauth", /* the unique window label */
        tauri::WindowUrl::External("https://dev-api.sparrow.techdomeaks.com/api/auth/google".parse().unwrap()),
    )
    .title("")
    .build()
    .unwrap();
}

#[tauri::command]
async fn open_oauth_window(handle: tauri::AppHandle) {
    let oauth_window = handle.get_window("oauth").unwrap();
    let _ = oauth_window.eval(&format!(
        "window.location.replace('https://dev-api.sparrow.techdomeaks.com/api/auth/google')"
    ));
    let one_sec = time::Duration::from_secs(1);
    thread::sleep(one_sec);

    let _ = oauth_window.center();
    let _ = oauth_window.show();
}

#[derive(Clone, serde::Serialize)]
struct Payload {
    url: String,
}

#[derive(Clone, serde::Serialize)]
struct Payload1 {
    message: String,
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            make_type_request_command,
            fetch_swagger_url_command,
            fetch_file_command,
            create_oauth_window,
            open_oauth_window
        ])
        .on_page_load(|wry_window, _payload| {
            if wry_window.url().host_str() == Some("www.google.com") {
                wry_window
                    .emit_all(
                        "receive-login",
                        Payload {
                            url: _payload.url().into(),
                        },
                    )
                    .unwrap();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

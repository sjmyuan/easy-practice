#!/usr/bin/env python3
"""
Text-to-Speech Batch Converter using Qwen TTS

This script converts a list of text lines to speech audio files using the Qwen TTS API.
Features:
- Hash-based file naming for deduplication
- Metadata tracking (text to audio mapping)
- Progress indication
- Append mode for incremental processing
"""

import os
import sys
import json
import hashlib
import argparse
import requests
import time
from pathlib import Path
from typing import Dict, Set
import dashscope


# Configuration
MODEL = "qwen3-tts-flash"
VOICE = "Jennifer"
LANGUAGE_TYPE = "English"
AUDIO_FORMAT = "wav"
METADATA_FILENAME = "metadata.json"
BASE_HTTP_API_URL = "https://dashscope.aliyuncs.com/api/v1"


dashscope.base_http_api_url = BASE_HTTP_API_URL

def generate_audio_filename(text: str) -> str:
    """Generate a hash-based filename for the given text."""
    text_hash = hashlib.md5(text.strip().encode('utf-8')).hexdigest()
    return f"{text_hash}.{AUDIO_FORMAT}"

def download_audio(url: str, output_path: Path) -> bool:
    """Download audio file from URL."""
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        with open(output_path, 'wb') as f:
            f.write(response.content)
        return True
    except Exception as e:
        print(f"Error downloading audio: {e}")
        return False


def synthesize_speech(text: str, output_path: Path, api_key: str) -> bool:
    """
    Synthesize speech for the given text and save to output_path.
    Returns True on success, False on failure.
    """
    try:
        response = dashscope.MultiModalConversation.call(
            model=MODEL,
            api_key=api_key,
            text=text,
            voice=VOICE,
            language_type=LANGUAGE_TYPE
        )
        
        # Check if response is successful
        if response.status_code != 200:
            print(f"Error: API returned status code {response.status_code}")
            print(f"Message: {response.message}")
            return False
        
        # Get audio URL from response
        audio_url = response.output.get('audio', {}).get('url')
        if not audio_url:
            print(f"Error: No audio URL in response for text: {text[:50]}...")
            return False
        # Download audio file
        return download_audio(audio_url, output_path)
            
    except Exception as e:
        print(f"Error synthesizing speech: {e}")
        return False



def read_problem_set(input_file: Path) -> dict:
    """Read and return the full problem set JSON object from the input file."""
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    if not (isinstance(data, dict) and isinstance(data.get('problems'), list)):
        raise ValueError("Input problem set JSON must be an object with a 'problems' array.")
    return data



def process_problem_set(input_file: Path, output_folder: Path, api_key: str):

    """Process a problem set JSON file (with 'problems' array), generate audio for problem and answer, and output new JSON."""
    dashscope.base_http_api_url = BASE_HTTP_API_URL
    output_folder.mkdir(parents=True, exist_ok=True)

    data = read_problem_set(input_file)
    problems = data['problems']
    print(f"Found {len(problems)} problems to process")
    if not problems:
        print("No problems to process. Exiting.")
        return

    processed_in_session: Set[str] = set()
    success_count = 0
    skip_count = 0
    error_count = 0

    for idx, problem in enumerate(problems, 1):
        print(f"\n[{idx}/{len(problems)}] Processing problem: {problem.get('problem', '')[:60]}")
        for field in ["problem", "answer"]:
            text = problem.get(field, "")
            if not text:
                problem[f"{field}_audio"] = None
                continue
            # Deduplication in session
            if text in processed_in_session:
                audio_filename = generate_audio_filename(text)
                problem[f"{field}_audio"] = audio_filename
                print(f"  → {field} audio: Skipped (duplicate in input)")
                skip_count += 1
                continue
            audio_filename = generate_audio_filename(text)
            audio_path = output_folder / audio_filename
            # Check if already exists
            if audio_path.exists():
                problem[f"{field}_audio"] = audio_filename
                print(f"  → {field} audio: Skipped (already exists: {audio_filename})")
                skip_count += 1
                processed_in_session.add(text)
                continue
            print(f"  → Generating {field} audio: {audio_filename}")
            if synthesize_speech(text, audio_path, api_key):
                problem[f"{field}_audio"] = audio_filename
                print(f"    ✓ Success")
                success_count += 1
            else:
                problem[f"{field}_audio"] = None
                print(f"    ✗ Failed")
                error_count += 1
            processed_in_session.add(text)
            time.sleep(1)

    # Save new problem set JSON (preserve all top-level fields, just update problems array)
    new_data = dict(data)
    new_data['problems'] = problems
    output_json_path = output_folder / ("new_" + input_file.name)
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(new_data, f, ensure_ascii=False, indent=2)
    print(f"\nSaved new problem set with audio fields to: {output_json_path}")

    # Print summary
    print("\n" + "="*60)
    print("Processing Complete!")
    print(f"  Success: {success_count}")
    print(f"  Skipped: {skip_count}")
    print(f"  Failed:  {error_count}")
    print("="*60)



def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Convert problem set JSON to speech audio for problem and answer fields.",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        'input_file',
        type=str,
        help='Path to input problem set JSON file'
    )
    parser.add_argument(
        'output_folder',
        type=str,
        help='Path to output folder for audio files and metadata'
    )
    parser.add_argument(
        '--api-key',
        type=str,
        default=None,
        help='DashScope API key (or set DASHSCOPE_API_KEY environment variable)'
    )

    args = parser.parse_args()

    # Get API key
    api_key = args.api_key or os.environ.get('DASHSCOPE_API_KEY')
    if not api_key:
        print("Error: API key required. Use --api-key or set DASHSCOPE_API_KEY environment variable.")
        sys.exit(1)

    # Validate input file
    input_file = Path(args.input_file)
    if not input_file.exists():
        print(f"Error: Input file not found: {input_file}")
        sys.exit(1)

    # Process
    output_folder = Path(args.output_folder)
    try:
        process_problem_set(input_file, output_folder, api_key)
    except KeyboardInterrupt:
        print("\n\nInterrupted by user. Progress has been saved.")
        sys.exit(0)
    except Exception as e:
        print(f"\nFatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()

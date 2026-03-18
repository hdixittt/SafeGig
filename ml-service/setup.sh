#!/bin/bash
# Run this once to set up the ML service virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
echo "ML service venv ready. Run: source venv/bin/activate && uvicorn main:app --reload"

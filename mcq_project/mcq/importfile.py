
import pandas as pd
from mcq.models import Question, Choice

def import_mcq_data(file_path):
    # Read the Excel file into a DataFrame
    df = pd.read_excel(file_path)

    for index, row in df.iterrows():
        # Create a Question object
        question = Question.objects.create(
            text=row['Question Text'],
        )

        # Create Choice objects
        choices = ['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4']
        correct_choice_index = int(row['Correct Choice']) - 1  # Adjust for 0-based indexing

        for i, choice_col in enumerate(choices):
            choice_text = row[choice_col]
            is_correct = i == correct_choice_index  # Mark the correct choice based on index

            Choice.objects.create(
                question=question,
                text=choice_text,
                is_correct=is_correct
            )

    print(f"{len(df)} MCQs imported successfully.")

































# import pandas as pd
# from mcq.models import Question, Choice

# def import_mcq_data(file_path):
#     # Read the Excel file into a DataFrame
#     df = pd.read_excel(file_path)

#     for index, row in df.iterrows():
#         # Create a Question object
#         question = Question.objects.create(
#             text=row['Question Text'],
#         )

#         # Create Choice objects
#         choices = ['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4']
#         for i, choice_col in enumerate(choices):
#             choice_text = row[choice_col]
#             is_correct = choice_text == row['Correct Choice']

#             Choice.objects.create(
#                 question=question,
#                 text=choice_text,
#                 is_correct=is_correct
#             )

#     print(f"{len(df)} MCQs imported successfully.")


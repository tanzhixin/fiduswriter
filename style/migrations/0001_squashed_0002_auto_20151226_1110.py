# Generated by Django 1.11.13 on 2018-08-14 17:33
from django.db import migrations, models
import style.models


class Migration(migrations.Migration):

    replaces = [('style', '0001_initial'), ('style', '0002_auto_20151226_1110')]

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CitationLocale',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('language_code', models.SlugField(help_text='language code of the locale file.', max_length=4)),
                ('contents', models.TextField(help_text='The XML style definiton.')),
            ],
        ),
        migrations.CreateModel(
            name='CitationStyle',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(help_text='The human readable title.', max_length=128)),
                ('short_title', models.SlugField(help_text='A title used for constant names.', max_length=40)),
                ('contents', models.TextField(help_text='The XML style definiton.')),
            ],
        ),
        migrations.CreateModel(
            name='DocumentFont',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(help_text='The human readable title.', max_length=128)),
                ('font_file', models.FileField(help_text='The font file.', upload_to=style.models.document_filename)),
                ('fontface_definition', models.TextField(help_text='The CSS definition of the font face (everything inside of @font-face{}). Add [URL] where the link to the font file is to appear.')),
            ],
        ),
        migrations.CreateModel(
            name='DocumentStyle',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(help_text='The human readable title.', max_length=128)),
                ('filename', models.SlugField(help_text='The base of the filenames the style occupies.', max_length=20)),
                ('contents', models.TextField(help_text='The CSS style definiton.')),
                ('fonts', models.ManyToManyField(blank=True, default=None, to='style.DocumentFont')),
            ],
        ),
    ]
